import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import { searchAliExpress } from "../../../services/aliexpress";

const CATALOGO = [
  "auriculares",
  "smartwatch",
  "freidora aire",
  "aspiradora robot",
  "powerbank",
  "funda movil",
  "cargador usb c",
  "raton gaming",
  "teclado mecanico",
  "lampara led",
];

function euros(valor: string | number | undefined) {
  if (valor === undefined || valor === null || valor === "") return "";
  return `${String(valor).replace(".", ",")}€`;
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let insertados = 0;

  for (const keywords of CATALOGO) {
    const resultado = await searchAliExpress(keywords);
    const productos =
      resultado?.data?.aliexpress_affiliate_product_query_response
        ?.resp_result?.result?.products?.product || [];
    const lista = Array.isArray(productos) ? productos : productos ? [productos] : [];

    for (const p of lista) {
      if (!p?.product_title) continue;
      const url = p.promotion_link || p.product_detail_url || "";
      if (!url) continue;

      const ya = (await sql`SELECT id FROM productos WHERE url = ${url} LIMIT 1`) as any[];
      if (ya.length > 0) continue;

      const extra = p.product_small_image_urls?.string || [];
      const fotos = Array.isArray(extra) ? extra : extra ? [extra] : [];
      const descNum = String(p.discount || "0").replace("%", "");

      await sql`
        INSERT INTO productos (
          nombre, tienda, precio, antes, descuento, categoria, imagen, url, disponible, imagenes, descripcion
        ) VALUES (
          ${p.product_title},
          ${"AliExpress"},
          ${euros(p.target_sale_price || p.target_app_sale_price)},
          ${euros(p.target_original_price || p.original_price)},
          ${descNum && descNum !== "0" ? `-${descNum}%` : "0%"},
          ${"Tecnología"},
          ${p.product_main_image_url || ""},
          ${url},
          ${true},
          ${JSON.stringify(fotos)},
          ${p.product_title}
        )
      `;
      insertados += 1;
    }
  }

  return NextResponse.json({ success: true, insertados });
}