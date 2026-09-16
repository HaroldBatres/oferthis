import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import zlib from "zlib";
import { parse } from "csv-parse";
import { Readable } from "stream";

const LIMITE = 400;

export async function GET() {
  try {
    const feedUrl = process.env.AWIN_FEED_URL;
    if (!feedUrl) {
      return NextResponse.json(
        { error: "Falta AWIN_FEED_URL en las variables de entorno" },
        { status: 500 }
      );
    }

    const res = await fetch(feedUrl);
    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "No se pudo descargar el feed de Awin" },
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

      if (muestra.length < 5) {
        muestra.push({
          in_stock: row.in_stock,
          savings_percent: row.savings_percent,
          search_price: row.search_price,
          product_name: row.product_name?.slice(0, 60),
        });
      }

      const enStock = String(row.in_stock ?? "").trim().toLowerCase();
      const stockOk = enStock === "" || enStock === "true" || enStock === "1" || enStock === "yes";
      const precioNum0 = parseFloat(row.search_price || "0");

      if (!stockOk || !(precioNum0 > 0) || !row.product_name || !row.aw_deep_link) {
        omitidos++;
        continue;
      }

      const nombre = String(row.product_name).slice(0, 250);
            const precioNum = precioNum0;
      const antesNum = parseFloat(row.rrp_price || row.search_price || "0");
      const moneda = row.currency || "EUR";
      const sufijo = moneda === "EUR" ? "€" : ` ${moneda}`;
      const precio = `${precioNum.toFixed(2).replace(".", ",")}${sufijo}`;
      const antes = `${antesNum.toFixed(2).replace(".", ",")}${sufijo}`;
      const descuentoPct = parseFloat(row.savings_percent || "0");
      const descuento = descuentoPct > 0 ? `-${Math.round(descuentoPct)}%` : "-0%";
            const imagen = row.large_image || row.merchant_image_url || "";
      const url = row.aw_deep_link;
      const autor = row.author || "";
      const descripcion = row.description || "";

            const existente = (await sql`
        SELECT id FROM productos
        WHERE nombre = ${nombre} AND tienda = 'CasaDelLibro'
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
            categoria = 'Libros',
            autor = ${autor},
            descripcion = ${descripcion},
            disponible = true
          WHERE id = ${existente[0].id}
        `;
        actualizados++;
      } else {
        await sql`
                 INSERT INTO productos (
            nombre, tienda, precio, antes, descuento, categoria,
            imagen, url, disponible, autor, descripcion
          ) VALUES (
            ${nombre}, 'CasaDelLibro', ${precio}, ${antes}, ${descuento}, 'Libros',
            ${imagen}, ${url}, true, ${autor}, ${descripcion}
          )
        `;
        insertados++;
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
      { error: "Fallo en importar-awin", detalles: err?.message },
      { status: 500 }
    );
  }
}