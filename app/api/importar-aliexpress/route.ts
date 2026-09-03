import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import { searchAliExpress } from "../../services/aliexpress";

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
  "tablet",
  "monitor",
  "webcam",
  "altavoz bluetooth",
  "maquina afeitar",
  "cepillo dientes electrico",
  "secador pelo",
  "plancha pelo",
  "robot cocina",
  "cafetera",
  "batidora",
  "organizador armario",
  "almohada",
  "sabanas",
  "toallas",
  "mochila",
  "zapatillas running",
  "banda elastica",
  "esterilla yoga",
  "bicicleta estatica",
  "camara vigilancia",
  "bombilla wifi",
  "enchufe inteligente",
  "proyector",
  "disco ssd",
  "memoria usb",
  "cable hdmi",
  "soporte movil coche",
  "masajeador",
  "humidificador",
];

function euros(valor: string | number | undefined) {
  if (valor === undefined || valor === null || valor === "") return "";
  const n = String(valor).replace(".", ",");
  return `${n}€`;
}

async function guardarProductos(keywords: string) {
  const resultado = await searchAliExpress(keywords);
  const productos =
    resultado?.data?.aliexpress_affiliate_product_query_response
      ?.resp_result?.result?.products?.product || [];

  const lista = Array.isArray(productos) ? productos : productos ? [productos] : [];
  let insertados = 0;

  for (const p of lista) {
    if (!p?.product_title) continue;

    const precio = euros(p.target_sale_price || p.target_app_sale_price);
    const antes = euros(p.target_original_price || p.original_price);
    const descNum = String(p.discount || "0").replace("%", "");
    const descuento = descNum && descNum !== "0" ? `-${descNum}%` : "0%";

        const extraFotos = p.product_small_image_urls?.string || [];
    const fotos = Array.isArray(extraFotos) ? extraFotos : extraFotos ? [extraFotos] : [];

    await sql`
      INSERT INTO productos (
        nombre, tienda, precio, antes, descuento, categoria, imagen, url, disponible, imagenes, descripcion
      ) VALUES (
        ${p.product_title},
        ${"AliExpress"},
        ${precio},
        ${antes},
        ${descuento},
        ${"Tecnología"},
        ${p.product_main_image_url || fotos[0] || ""},
        ${p.promotion_link || p.product_detail_url || ""},
        ${true},
        ${JSON.stringify(fotos)},
        ${p.product_title}
      )
    `;
    insertados += 1;
  }

  return insertados;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const ADMIN_USER_ID = "user_3Hd21PlPrp9kabWnbxXrPCzlH0D";
    if (!userId || userId !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    if (body.catalogo === true) {
      let total = 0;
      for (const palabra of CATALOGO) {
        total += await guardarProductos(palabra);
      }
      return NextResponse.json({ success: true, insertados: total });
    }

    const keywords = String(body.keywords || "").trim();
    if (!keywords) {
      return NextResponse.json({ error: "Falta la búsqueda" }, { status: 400 });
    }

    const insertados = await guardarProductos(keywords);
    return NextResponse.json({ success: true, insertados });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al importar" }, { status: 500 });
  }
}