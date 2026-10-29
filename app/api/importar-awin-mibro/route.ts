import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import zlib from "zlib";
import { parse } from "csv-parse";
import { Readable } from "stream";

const LIMITE = 80;

export async function GET() {
  try {
    const feedUrl = process.env.AWIN_MIBRO_FEED_URL;
    if (!feedUrl) {
      return NextResponse.json(
        { error: "Falta AWIN_MIBRO_FEED_URL en las variables de entorno" },
        { status: 500 }
      );
    }

    const res = await fetch(feedUrl);
    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "No se pudo descargar el feed de Awin Mibro" },
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

      const nombre = String(row.product_name || "").trim();
      const imagen = String(
        row.merchant_image_url || row.aw_image_url || row.large_image || ""
      ).trim();
      const url = String(row.aw_deep_link || row.merchant_deep_link || "").trim();

      if (!nombre || !imagen || !url) {
        omitidos++;
        continue;
      }

      const precioNum = parseFloat(String(row.search_price || "0").replace(",", ".")) || 0;
      const antesNum = parseFloat(String(row.store_price || row.rrp_price || "0").replace(",", ".")) || 0;
      const savings = parseFloat(String(row.savings_percent || "0").replace(",", ".")) || 0;

      // Solo si hay descuento real (savings > 0 o precio anterior mayor)
      const tieneDescuento = savings > 1 || (antesNum > precioNum && precioNum > 0);
      if (!tieneDescuento) {
        omitidos++;
        continue;
      }

      const precio = precioNum.toFixed(2).replace(".", ",") + "€";
      const antes = antesNum > precioNum ? antesNum.toFixed(2).replace(".", ",") + "€" : "";
      const pct = savings > 0 ? Math.round(savings) : Math.round((1 - precioNum / antesNum) * 100);
      const descuento = pct > 0 ? `-${pct}%` : "";

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
            categoria = 'Tecnologia',
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
            ${nombre}, 'Mibro', ${precio}, ${antes}, ${descuento}, 'Tecnologia',
            ${imagen}, ${url}, true
          )
        `;
        insertados++;
      }

      if (muestra.length < 5) {
        muestra.push({ nombre: nombre.slice(0, 60), precio, descuento });
      }

      if (insertados + actualizados >= LIMITE) break;
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