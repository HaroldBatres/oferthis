import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import {
  extraerIdAliExpress,
  extraerFotosAliExpress,
  getAliExpressByIds,
  searchAliExpress,
} from "../../services/aliexpress";

export async function POST() {
  const { userId } = await auth();
  if (userId !== "user_3Hd21PlPrp9kabWnbxXrPCzlH0D") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const filas = (await sql`
    SELECT id, nombre, url FROM productos
    WHERE LOWER(tienda) = 'aliexpress'
  `) as any[];

  let actualizados = 0;

  for (const fila of filas) {
    let detalle: any = null;
    const pid = extraerIdAliExpress(fila.url || "");

    if (pid) {
      const raw = await getAliExpressByIds([pid]);
      const p =
        raw?.aliexpress_affiliate_productdetail_get_response?.resp_result
          ?.result?.products?.product;
      detalle = Array.isArray(p) ? p[0] : p;
    }

    if (!detalle) {
      const busqueda = await searchAliExpress(String(fila.nombre).slice(0, 40));
      const lista =
        busqueda?.data?.aliexpress_affiliate_product_query_response
          ?.resp_result?.result?.products?.product || [];
      const arr = Array.isArray(lista) ? lista : lista ? [lista] : [];
      detalle = arr[0];
    }

    if (!detalle) continue;

    const fotos = extraerFotosAliExpress(detalle);
    if (fotos.length === 0) continue;

    await sql`
      UPDATE productos SET
        imagen = ${fotos[0]},
        imagenes = ${JSON.stringify(fotos)}::jsonb,
        descripcion = ${detalle.product_title || fila.nombre},
        url = ${detalle.promotion_link || detalle.product_detail_url || fila.url}
      WHERE id = ${fila.id}
    `;
    actualizados += 1;
  }

  return NextResponse.json({ success: true, actualizados });
}