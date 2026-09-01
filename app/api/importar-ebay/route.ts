import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { searchEbayOfertas } from "../../services/ebay";

const CAMPID = process.env.EBAY_CAMPAIGN_ID || "";

function enlaceAfiliado(url: string) {
  if (!url) return url;
  if (!CAMPID) return url;
  if (url.includes("campid=")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}mkcid=1&mkrid=1185-53479-19255-0&siteid=186&campid=${CAMPID}&toolid=10001&mkevt=1`;
}

export async function GET() {
  try {
    const ofertas = await searchEbayOfertas("oferta", 80);
    let insertados = 0;
    let omitidos = 0;

    for (const o of ofertas) {
      const url = enlaceAfiliado(o.url);
      if (!url) {
        omitidos++;
        continue;
      }

      const existe = (await sql`
                SELECT id FROM productos
        WHERE nombre = ${o.title} AND LOWER(tienda) = 'ebay'
        LIMIT 1
      `) as any[];
      if (existe.length > 0) {
        omitidos++;
        continue;
      }

      await sql`
        INSERT INTO productos (
          nombre, tienda, precio, antes, descuento,
          categoria, imagen, url, descripcion, disponible
        )
        VALUES (
          ${o.title},
          ${"eBay"},
          ${o.precio},
          ${o.antes || o.precio},
          ${o.descuento || ""},
          ${"Ofertas"},
          ${o.imagen || ""},
          ${url},
          ${o.descripcion || ""},
          ${true}
        )
      `;
      insertados++;
    }

    return NextResponse.json({ ok: true, insertados, omitidos });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}