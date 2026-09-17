import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import zlib from "zlib";
import { parse } from "csv-parse";
import { Readable } from "stream";

const LIMITE_DESTACADOS = 400;
const LIMITE_VARIOS = 300;

const AUTORES_DESTACADOS = [
  "Bob Proctor",
  "Brian Tracy",
  "Bryan Tracy",
  "Tony Robbins",
  "Jim Rohn",
  "Brendon Burchard",
  "Napoleon Hill",
  "Robin Sharma",
  "Tim Ferriss",
  "Robert Kiyosaki",
  "Esther Hicks",
  "Jerry Hicks",
  "Rhonda Byrne",
  "Jack Canfield",
  "Lise Bourbeau",
  "Anamar Orihuela",
  "John Bradshaw",
];

function normaliza(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function autorDeFila(row: any) {
  return String(
    row["BooksNL:author"] || row.author || row.Author || ""
  ).trim();
}

function esDestacado(autor: string, nombre: string) {
  const texto = `${normaliza(autor)} ${normaliza(nombre)}`;
  return AUTORES_DESTACADOS.some((a) => texto.includes(normaliza(a)));
}

function imagenGrande(url: string) {
  const u = String(url || "");
  if (!u) return "";
  try {
    const parsed = new URL(u);
    let inner = parsed.searchParams.get("url") || "";
    if (inner && /casadellibro/i.test(inner)) {
      inner = inner
        .replace(/^ssl:\/\//i, "https://")
        .replace(/^ssl:/i, "https://");
      if (!inner.startsWith("http")) inner = "https://" + inner.replace(/^\/\//, "");
      return inner.replace(/\/t2\//g, "/t0/");
    }
  } catch {
    // productserve
  }
  if (u.includes("productserve.com")) {
    return u.replace(/w=\d+/gi, "w=800").replace(/h=\d+/gi, "h=800");
  }
  return u;
}

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
    let destacados = 0;
    let varios = 0;
    let columnas: string[] = [];
    const muestra: any[] = [];

    for await (const row of stream as any) {
      procesados++;
      if (procesados === 1) columnas = Object.keys(row);

      const autor = autorDeFila(row);
      const nombre = String(row.product_name || "").slice(0, 250);
      const pedido = esDestacado(autor, nombre);

      if (!pedido && varios >= LIMITE_VARIOS) {
        omitidos++;
        if (destacados >= LIMITE_DESTACADOS) break;
        continue;
      }
      if (pedido && destacados >= LIMITE_DESTACADOS) {
        omitidos++;
        continue;
      }

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
        row.rrp_price || row.search_price || row.store_price || "0"
      );
      const moneda = row.currency || "EUR";
      const sufijo = moneda === "EUR" ? "€" : ` ${moneda}`;
      const precio = `${precioNum0.toFixed(2).replace(".", ",")}${sufijo}`;
      const antes = `${antesNum.toFixed(2).replace(".", ",")}${sufijo}`;
      const descuentoPct = parseFloat(row.savings_percent || "0");
      const descuento =
        descuentoPct > 0 ? `-${Math.round(descuentoPct)}%` : "-0%";
      const imagen = imagenGrande(
        row.large_image || row.aw_image_url || row.merchant_image_url || ""
      );
      const url = row.aw_deep_link || row.merchant_deep_link;
      const descripcion =
        row.description || row.product_short_description || "";

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

      if (pedido) destacados++;
      else varios++;

      if (muestra.length < 10) {
        muestra.push({
          nombre: nombre.slice(0, 70),
          autor,
          tipo: pedido ? "destacado" : "vario",
          imagen: String(imagen).slice(0, 90),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      columnas,
      procesados,
      insertados,
      actualizados,
      omitidos,
      destacados,
      varios,
      muestra,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Fallo en importar-awin", detalles: err?.message },
      { status: 500 }
    );
  }
}