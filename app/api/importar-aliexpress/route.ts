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
    "soporte movil coche",
  "masajeador",
  "humidificador",
  "silla gaming",
  "auriculares gaming",
  "mando ps4",
  "volante gaming",
  "comedero perro",
  "juguete gato",
  "arnes perro",
  "cama para perro",
  "taladro inalambrico",
  "set destornilladores",
  "caja herramientas",
  "nivel laser",
  "mancuernas",
  "cinta de correr",
  "olla a presion",
  "vajilla",
];

function euros(valor: string | number | undefined) {
  if (valor === undefined || valor === null || valor === "") return "";
  const n = String(valor).replace(".", ",");
  return `${n}€`;
}

const PALABRAS_CATEGORIA: { categoria: string; palabras: string[] }[] = [
  { categoria: "Tecnologia", palabras: ["auricular", "smartwatch", "powerbank", "cargador", "usb", "raton gaming", "teclado", "tablet", "monitor", "webcam", "altavoz", "disco ssd", "memoria usb", "cable hdmi", "proyector", "bombilla wifi", "enchufe inteligente", "camara vigilancia", "funda movil", "smartphone", "telefono", "ssd", "hdd", "sata", "hdmi", "disco duro", "cámara solar", "cámara ip", "cctv", "interruptor", "wifi", "bombilla inteligente", "relé", "portatil"] },
  { categoria: "Hogar", palabras: ["aspiradora", "lampara", "organizador armario", "almohada", "sabanas", "toallas", "humidificador", "difusor"] },
  { categoria: "Gaming", palabras: ["gaming", "consola", "mando", "joystick"] },
  { categoria: "Deporte", palabras: ["running", "banda elastica", "esterilla yoga", "bicicleta", "fitness", "mancuerna", "resistencia"] },
  { categoria: "Cocina", palabras: ["freidora", "robot cocina", "cafetera", "batidora", "sarten", "olla", "vajilla"] },
  { categoria: "Moda", palabras: ["mochila", "bolso", "zapatilla", "gafas de sol", "reloj mujer", "cinturon", "chaqueta", "vestido"] },
  { categoria: "Belleza", palabras: ["maquina afeitar", "cepillo dientes electrico", "secador pelo", "plancha pelo", "maquillaje", "crema facial", "depiladora", "masajeador", "acné", "acne", "parche", "hidrocoloide", "facial", "mascarilla", "piel"] },
  { categoria: "Mascotas", palabras: ["perro", "gato", "mascota", "comedero", "correa", "arnes"] },
  { categoria: "Automocion", palabras: ["coche", "moto", "neumatico", "tpms", "soporte movil coche", "vehiculo"] },
  { categoria: "Herramientas", palabras: ["taladro", "destornillador", "llave inglesa", "tornillo", "herramienta", "sierra", "amoladora"] },
];

function detectarCategoria(nombre: string): string {
  const texto = nombre.toLowerCase();
  for (const grupo of PALABRAS_CATEGORIA) {
    if (grupo.palabras.some((p) => texto.includes(p))) {
      return grupo.categoria;
    }
  }
  return "Hogar";
}

async function guardarProductos(keywords: string) {
  const resultado = await searchAliExpress(keywords);
  const productos =
    resultado?.data?.aliexpress_affiliate_product_query_response
      ?.resp_result?.result?.products?.product || [];

  const lista = Array.isArray(productos) ? productos : productos ? [productos] : [];
  let insertados = 0;
  let actualizados = 0;

  for (const p of lista) {
    if (!p?.product_title) continue;

    const precio = euros(p.target_sale_price || p.target_app_sale_price);
    const antes = euros(p.target_original_price || p.original_price);
    const descNum = String(p.discount || "0").replace("%", "");
    const descuento = descNum && descNum !== "0" ? `-${descNum}%` : "0%";

    const extraFotos = p.product_small_image_urls?.string || [];
    const fotos = Array.isArray(extraFotos) ? extraFotos : extraFotos ? [extraFotos] : [];
    const imagen = p.product_main_image_url || fotos[0] || "";
    const url = p.promotion_link || p.product_detail_url || "";
    const categoria = detectarCategoria(p.product_title);

    const existente = (await sql`
      SELECT id FROM productos
      WHERE nombre = ${p.product_title} AND tienda = 'AliExpress'
      LIMIT 1
    `) as any[];

    if (existente.length > 0) {
      await sql`
        UPDATE productos SET
          precio = ${precio},
          antes = ${antes},
          descuento = ${descuento},
          categoria = ${categoria},
          imagen = ${imagen},
          url = ${url},
          disponible = true,
          imagenes = ${JSON.stringify(fotos)}
        WHERE id = ${existente[0].id}
      `;
      actualizados += 1;
    } else {
      await sql`
        INSERT INTO productos (
          nombre, tienda, precio, antes, descuento, categoria, imagen, url, disponible, imagenes, descripcion
        ) VALUES (
          ${p.product_title},
          ${"AliExpress"},
          ${precio},
          ${antes},
          ${descuento},
          ${categoria},
          ${imagen},
          ${url},
          ${true},
          ${JSON.stringify(fotos)},
          ${p.product_title}
        )
      `;
      insertados += 1;
    }
  }

  return { insertados, actualizados };
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
      let totalInsertados = 0;
      let totalActualizados = 0;
      for (const palabra of CATALOGO) {
        const r = await guardarProductos(palabra);
        totalInsertados += r.insertados;
        totalActualizados += r.actualizados;
      }
      return NextResponse.json({
        success: true,
        insertados: totalInsertados,
        actualizados: totalActualizados,
      });
    }

    const keywords = String(body.keywords || "").trim();
    if (!keywords) {
      return NextResponse.json({ error: "Falta la búsqueda" }, { status: 400 });
    }

    const { insertados, actualizados } = await guardarProductos(keywords);
    return NextResponse.json({ success: true, insertados, actualizados });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al importar" }, { status: 500 });
  }
}