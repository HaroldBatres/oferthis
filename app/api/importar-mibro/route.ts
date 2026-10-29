import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import zlib from "zlib";
import { parse } from "csv-parse";
import { Readable } from "stream";

const FEED_URL =
  "https://productdata.awin.com/datafeed/download/apikey/c4daa29bbf25bf792a0781fcea8326c3/language/any/fid/118730/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id,savings_percent,rrp_price,brand_name,large_image,product_short_description,dimensions,condition,brand_id,delivery_time,terms_of_contract,in_stock,stock_status,alternate_image_four,reviews,rating/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/";

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
    const res = await fetch(FEED_URL);
    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "No se pudo descargar el feed de Mibro" },
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

      const nombre = String(row.product_name || "").slice(0, 250);
      const enStock = String(row.in_stock ?? "").trim().toLowerCase();
      const stockOk =
        enStock === "" ||
        enStock === "true" ||
        enStock === "1" ||
        enStock === "yes";

      const precioNum0 = parseFloat(
        row.search_price || row.store_price || row.display_price || "0"
      );

      if (!stockOk || !(precioNum0 > 0) || !nombre || !row.aw_deep_link) {
        omitidos++;
        continue;
      }

      const antesNum = parseFloat(
        row.rrp_price || row.store_price || row.search_price || "0"
      );
      const moneda = row.currency || "EUR";
      const sufijo = moneda === "EUR" ? "€" : ` ${moneda}`;
      const precio = `${precioNum0.toFixed(2).replace(".", ",")}${sufijo}`;
      const antes = `${antesNum.toFixed(2).replace(".", ",")}${sufijo}`;

      // Calculamos descuento real comparando precio y precio anterior
      let descuento = "-0%";
      if (antesNum > precioNum0) {
        const pct = Math.round((1 - precioNum0 / antesNum) * 100);
        if (pct > 0) descuento = `-${pct}%`;
      }

      const imagen = imagenGrande(
        row.large_image || row.aw_image_url || row.merchant_image_url || ""
      );
      const url = row.aw_deep_link || row.merchant_deep_link;
      const descripcion =
        row.description || row.product_short_description || "";

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
            descripcion = ${descripcion},
            disponible = true
          WHERE id = ${existente[0].id}
        `;
        actualizados++;
      } else {
        await sql`
          INSERT INTO productos (
            nombre, tienda, precio, antes, descuento, categoria,
            imagen, url, disponible, descripcion
          ) VALUES (
            ${nombre}, 'Mibro', ${precio}, ${antes}, ${descuento}, 'Tecnologia',
            ${imagen}, ${url}, true, ${descripcion}
          )
        `;
        insertados++;
      }

      if (muestra.length < 5) {
        muestra.push({
          nombre: nombre.slice(0, 70),
          precio,
          antes,
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
      { error: "Fallo en importar-mibro", detalles: err?.message },
      { status: 500 }
    );
  }
}