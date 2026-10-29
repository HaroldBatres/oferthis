import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import zlib from "zlib";
import { parse } from "csv-parse";
import { Readable } from "stream";

const LIMITE = 80;

async function traducirDescripcion(texto: string): Promise<string> {
  const limpio = String(texto || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!limpio) return "";

  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=" +
      encodeURIComponent(limpio.slice(0, 4500));
    const r = await fetch(url);
    if (!r.ok) return limpio;
    const data = await r.json();
    const trozos = Array.isArray(data?.[0]) ? data[0] : [];
    const es = trozos
      .map((x: any) => (Array.isArray(x) ? x[0] : ""))
      .join("")
      .trim();
    return es || limpio;
  } catch {
    return limpio;
  }
}

async function fotosMibro(enlaceTienda: string, nombre: string): Promise<string[]> {
  try {
    if (!enlaceTienda) return [];

    let pagina = enlaceTienda;
    if (!pagina.includes("mibrofit.com")) {
      const redir = await fetch(pagina, { redirect: "follow" });
      pagina = redir.url || pagina;
    }

    const u = new URL(pagina);
    if (!u.hostname.includes("mibrofit.com")) return [];

    const path = u.pathname.replace(/\/$/, "");
    const js = await fetch(`${u.origin}${path}.js`);
    if (!js.ok) return [];
    const data = await js.json();

    const variantParam = u.searchParams.get("variant") || "";
    const nombreL = nombre.toLowerCase();
    const variants = Array.isArray(data.variants) ? data.variants : [];
    const variante =
      variants.find((v: any) => {
        const id = String(v.id || "");
        return (
          variantParam &&
          (id === variantParam || variantParam.startsWith(id) || id.startsWith(variantParam))
        );
      }) ||
      variants.find((v: any) => nombreL.includes(String(v.title || "").toLowerCase()));

    const vid = variante ? Number(variante.id) : 0;
    const media = Array.isArray(data.media) ? data.media : [];
    const fotos: string[] = [];

    for (const m of media) {
      if (m.media_type && m.media_type !== "image") continue;
      const src = String(m.src || m.preview_image?.src || "");
      if (!src.startsWith("http")) continue;
      const ids = Array.isArray(m.variant_ids) ? m.variant_ids.map(Number) : [];
      if (vid && ids.length > 0 && !ids.includes(vid)) continue;
      if (!fotos.includes(src)) fotos.push(src);
    }

    const destacada = variante?.featured_image?.src;
    if (destacada && destacada.startsWith("http")) {
      const i = fotos.indexOf(destacada);
      if (i > 0) fotos.splice(i, 1);
      if (i !== 0) fotos.unshift(destacada);
    }

    return fotos;
  } catch {
    return [];
  }
}

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
      const imagenFeed = String(
        row.merchant_image_url || row.aw_image_url || row.large_image || ""
      ).trim();
      const url = String(row.aw_deep_link || row.merchant_deep_link || "").trim();
      const ficha = String(row.merchant_deep_link || row.aw_deep_link || "").trim();

      if (!nombre || !imagenFeed || !url) {
        omitidos++;
        continue;
      }

      const precioNum = parseFloat(String(row.search_price || "0").replace(",", ".")) || 0;
      const antesNum =
        parseFloat(String(row.store_price || row.rrp_price || "0").replace(",", ".")) || 0;
      const savings = parseFloat(String(row.savings_percent || "0").replace(",", ".")) || 0;

      const tieneDescuento = savings > 1 || (antesNum > precioNum && precioNum > 0);
      if (!tieneDescuento) {
        omitidos++;
        continue;
      }

      const precio = precioNum.toFixed(2).replace(".", ",") + "€";
      const antes = antesNum > precioNum ? antesNum.toFixed(2).replace(".", ",") + "€" : "";
      const pct =
        savings > 0 ? Math.round(savings) : Math.round((1 - precioNum / antesNum) * 100);
      const descuento = pct > 0 ? `-${pct}%` : "";

      const descripcion = await traducirDescripcion(
        String(row.description || row.product_short_description || "").trim()
      );

      const deLaFicha = await fotosMibro(ficha, nombre);
      const fotos = deLaFicha.length > 0 ? deLaFicha : [imagenFeed];
      const imagen = fotos[0] || imagenFeed;

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
            imagenes = ${JSON.stringify(fotos)}::jsonb,
            url = ${url},
            descripcion = ${descripcion},
            categoria = 'Tecnologia',
            disponible = true
          WHERE id = ${existente[0].id}
        `;
        actualizados++;
      } else {
        await sql`
          INSERT INTO productos (
            nombre, tienda, precio, antes, descuento, categoria,
            imagen, imagenes, url, descripcion, disponible
          ) VALUES (
            ${nombre}, 'Mibro', ${precio}, ${antes}, ${descuento}, 'Tecnologia',
            ${imagen}, ${JSON.stringify(fotos)}::jsonb, ${url}, ${descripcion}, true
          )
        `;
        insertados++;
      }

      if (muestra.length < 5) {
        muestra.push({
          nombre: nombre.slice(0, 50),
          fotos: fotos.length,
          descripcion: descripcion.slice(0, 80),
        });
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