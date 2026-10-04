import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import { searchAliExpress } from "../../services/aliexpress";

const CATALOGO = [
  // Moda
  "sudadera hombre",
  "sudadera mujer",
  "hoodie",
  "abrigo hombre",
  "abrigo mujer",
  "chaqueta otoño",
  "jersey punto",
  "cazadora",
  "plumifero",
  "zapatillas hombre",
  "zapatillas mujer",
  "botas mujer",
  "mochila",
  // Halloween
  "disfraz halloween",
  "disfraz adulto halloween",
  "mascara halloween",
  "calabaza led",
  "decoracion halloween",
  "luces halloween",
  // Tecnología
  "auriculares",
  "smartwatch",
  "powerbank",
  "funda movil",
  "cargador usb c",
  "tablet",
  "monitor",
  "webcam",
  "altavoz bluetooth",
  "disco ssd",
  "memoria usb",
  "cable hdmi",
  "proyector",
  // Hogar
  "aspiradora robot",
  "lampara led",
  "organizador armario",
  "almohada",
  "sabanas",
  "toallas",
  "humidificador",
  "bombilla wifi",
  "enchufe inteligente",
  // Gaming
  "raton gaming",
  "teclado mecanico",
  "silla gaming",
  "auriculares gaming",
  "mando ps4",
  "volante gaming",
  // Deporte
  "zapatillas running",
  "banda elastica",
  "esterilla yoga",
  "bicicleta estatica",
  "mancuernas",
  "cinta de correr",
  // Cocina
  "freidora aire",
  "robot cocina",
  "cafetera",
  "batidora",
  "olla a presion",
  "vajilla",
  // Belleza
  "maquina afeitar",
  "cepillo dientes electrico",
  "secador pelo",
  "plancha pelo",
  "masajeador",
  // Mascotas
  "comedero perro",
  "juguete gato",
  "arnes perro",
  "cama para perro",
  // Coche
  "soporte movil coche",
  "camara vigilancia",
  // Bricolaje
  "taladro inalambrico",
  "set destornilladores",
  "caja herramientas",
  "nivel laser",
];

function euros(valor: string | number | undefined) {
  if (valor === undefined || valor === null || valor === "") return "";
  const n = String(valor).replace(".", ",");
  return `${n}€`;
}

const PALABRAS_CATEGORIA: { categoria: string; palabras: string[] }[] = [
  {
    categoria: "Moda",
    palabras: [
      "sudadera",
      "hoodie",
      "abrigo",
      "chaqueta",
      "jersey",
      "cazadora",
      "plumifero",
      "zapatilla",
      "zapato",
      "bota",
      "mochila",
      "bolso",
      "disfraz",
      "mascara halloween",
      "halloween",
    ],
  },
  {
    categoria: "Tecnologia",
    palabras: [
      "auricular",
      "smartwatch",
      "powerbank",
      "cargador",
      "usb",
      "raton gaming",
      "teclado",
      "tablet",
      "monitor",
      "webcam",
      "altavoz",
      "disco ssd",
      "memoria usb",
      "cable hdmi",
      "proyector",
      "bombilla wifi",
      "enchufe inteligente",
      "camara vigilancia",
      "funda movil",
      "portatil",
    ],
  },
  {
    categoria: "Hogar",
    palabras: [
      "aspiradora",
      "lampara",
      "organizador",
      "almohada",
      "sabanas",
      "toallas",
      "humidificador",
      "calabaza",
      "decoracion halloween",
      "luces halloween",
    ],
  },
  {
    categoria: "Gaming",
    palabras: ["gaming", "consola", "mando", "joystick", "volante"],
  },
  {
    categoria: "Deporte",
    palabras: [
      "running",
      "banda elastica",
      "esterilla yoga",
      "bicicleta",
      "fitness",
      "mancuerna",
    ],
  },
  {
    categoria: "Cocina",
    palabras: [
      "freidora",
      "robot cocina",
      "cafetera",
      "batidora",
      "olla",
      "vajilla",
    ],
  },
  {
    categoria: "Belleza",
    palabras: [
      "afeitar",
      "cepillo dientes",
      "secador",
      "plancha pelo",
      "masajeador",
      "maquillaje",
    ],
  },
  {
    categoria: "Mascotas",
    palabras: ["perro", "gato", "mascota", "comedero", "arnes", "cama para"],
  },
  {
    categoria: "Automocion",
    palabras: ["coche", "soporte movil coche"],
  },
  {
    categoria: "Herramientas",
    palabras: [
      "taladro",
      "destornillador",
      "caja herramientas",
      "nivel laser",
      "herramienta",
    ],
  },
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

  const lista = Array.isArray(productos)
    ? productos
    : productos
      ? [productos]
      : [];
  let insertados = 0;
  let actualizados = 0;

  for (const p of lista) {
    if (!p?.product_title) continue;

    const precio = euros(p.target_sale_price || p.target_app_sale_price);
    const antes = euros(p.target_original_price || p.original_price);
    const descNum = String(p.discount || "0").replace("%", "");
    const descuento = descNum && descNum !== "0" ? `-${descNum}%` : "0%";

    const extraFotos = p.product_small_image_urls?.string || [];
    const fotos = Array.isArray(extraFotos)
      ? extraFotos
      : extraFotos
        ? [extraFotos]
        : [];
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