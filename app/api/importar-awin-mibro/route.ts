import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import zlib from "zlib";
import { parse } from "csv-parse";
import { Readable } from "stream";

const LIMITE = 300;

function imagenGrande(url: string) {
  const u = String(url || "");
  if (!u) return "";
  if (u.includes("productserve.com")) {
    return u.replace(/w=\d+/gi, "w=800").replace(/h=\d+/gi, "h=800");
  }
  return u;
}

export async function GET() {
  try {
    const feedUrl = process.env.AWIN_MIBRO_FEED_URL || process.env.AWIN_FEED_URL;
    if (!feedUrl) {
      return NextResponse.json(
        { error: "Falta AWIN_MIBRO_FEED_URL (o AWIN_FEED_URL) en .env.local" },
        { status: 500 }
      );
    }

    const res = await fetch(feedUrl);
    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "No se pudo descargar el feed de Awin para Mibro" },
        { status: 500 }
      );
    }

    const nodeStream = Readable.fromWeb(res.body as any);
    const gunzip = zlib.createGunzip();
    const parser = parse({
      columns: true,
      delimiter: ",",
      relax_column_count: true,
      skip_empty_lines: true,
    });

    const stream = nodeStream.pipe(gunzip).pipe(parser);

    let procesados = 0;
    let insertados = 0;
    let actualizados = 0;
    let omitidos = 0;
    const muestra: any[] = [];

    for await (const row of stream as any) {
      procesados++;

      const merchant = String(
        row.merchant_name || row.brand_name || row.merchant_id || ""
      ).toLowerCase();

      // Solo productos de Mibro (ajusta si el nombre en el feed es distinto)
      if (!merchant.includes("mibro")) {
        omitidos++;
        continue;
      }

      const nombre = String(row.product_name || "").slice(0, 250);
      const enStock = String(row.in_stock ?? "").trim().toLowerCase();
      const stockOk =
        enStock === "" ||
        enStock === "true" ||
        enStock === "1" ||
        enStock === "yes";

      const precioNum = parseFloat(
        row.search_price || row.store_price || row.display_price || "0"
      );

      if (!stockOk || !(precioNum > 0) || !nombre || !row.aw_deep_link) {
        omitidos++;
        continue;
      }

      if (insertados + actualizados >= LIMITE) break;

      const antesNum = parseFloat(
        row.rrp_price || row.search_price || row.store_price || "0"
      );
      const moneda = row.currency || "EUR";
      const sufijo = moneda === "EUR" ? "€" : ` ${moneda}`;
      const precio = `${precioNum.toFixed(2).replace(".", ",")}${sufijo}`;
      const antes = `${antesNum.toFixed(2).replace(".", ",")}${sufijo}`;
      const descuentoPct = parseFloat(row.savings_percent || "0");
      const descuento =
        descuentoPct > 0 ? `-${Math.round(descuentoPct)}%` : "-0%";

      const imagen = imagenGrande(
        row.large_image || row.aw_image_url || row.merchant_image_url || ""
      );
      const url = row.aw_deep_link || row.merchant_deep_link;
      const categoria =
        row.merchant_category ||
        row.category_name ||
        row.product_type ||
        "Tecnología";

      const existente = (await sql`
        SELECT id FROM productos
        WHERE nombre = ${nombre} AND tienda = 'Mibro'
        LIMIT 1
      `) as any[];

      if (existente.length > 0) {
        await sql`
          UPDATE productos SET
            precio = ${precio},
            antes = ${antes},
            descuento = ${descuento},
            imagen = ${imagen},
            url = ${url},
            categoria = ${categoria},
            disponible = true
          WHERE id = ${existente[0].id}
        `;
        actualizados++;
      } else {
        await sql`
          INSERT INTO productos (
            nombre, tienda, precio, antes, descuento, categoria,
            imagen, url, disponible
          ) VALUES (
            ${nombre}, 'Mibro', ${precio}, ${antes}, ${descuento}, ${categoria},
            ${imagen}, ${url}, true
          )
        `;
        insertados++;
      }

      if (muestra.length < 5) {
        muestra.push({
          nombre: nombre.slice(0, 60),
          precio,
          descuento,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      procesados,
      insertados,
      actualizados,
      omitidos,
      muestra,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Fallo en importar-awin-mibro", detalles: err?.message },
      { status: 500 }
    );
  }
}