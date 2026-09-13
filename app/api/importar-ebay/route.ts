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

const PALABRAS_CATEGORIA: { categoria: string; palabras: string[] }[] = [
  { categoria: "Tecnologia", palabras: ["portatil", "laptop", "smartphone", "telefono", "auricular", "tablet", "smartwatch", "monitor", "teclado", "raton", "webcam", "cargador", "adaptador", "usb", "bateria", "power bank"] },
  { categoria: "Hogar", palabras: ["aspiradora", "robot aspirador", "humidificador", "ventilador", "lampara", "aire acondicionado", "organizador", "almohada", "cortina", "alfombra"] },
  { categoria: "Gaming", palabras: ["gaming", "consola", "playstation", "xbox", "nintendo", "mando", "joystick", "teclado mecanico"] },
  { categoria: "Deporte", palabras: ["running", "bicicleta", "fitness", "cinta de correr", "yoga", "pesa", "mancuerna", "deportivo", "deportiva"] },
  { categoria: "Cocina", palabras: ["freidora", "cafetera", "batidora", "sarten", "olla", "cuchillo cocina", "vajilla"] },
  { categoria: "Moda", palabras: ["zapatilla", "camiseta", "pantalon", "mochila", "bolso", "vestido", "chaqueta", "gafas de sol"] },
  { categoria: "Belleza", palabras: ["secador", "plancha de pelo", "maquillaje", "crema facial", "perfume", "depiladora"] },
  { categoria: "Mascotas", palabras: ["perro", "gato", "mascota", "comedero", "correa", "arnes"] },
  { categoria: "Automocion", palabras: ["coche", "moto", "motocicleta", "neumatico", "tpms", "vehiculo", "carenado", "parabrisas"] },
  { categoria: "Herramientas", palabras: ["destornillador", "taladro", "llave inglesa", "tornillo", "brico", "herramienta"] },
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

export async function GET() {
  try {
    const ofertas = await searchEbayOfertas("oferta", 80);
    let insertados = 0;
    let omitidos = 0;
    let actualizados = 0;

    for (const o of ofertas) {
      const url = enlaceAfiliado(o.url);
      if (!url) {
        omitidos++;
        continue;
      }

      const existe = (await sql`
        SELECT id, entrega FROM productos
        WHERE nombre = ${o.title} AND LOWER(tienda) = 'ebay'
        LIMIT 1
      `) as any[];

      if (existe.length > 0) {
        if (o.entrega && !existe[0].entrega) {
          await sql`
            UPDATE productos
            SET entrega = ${o.entrega}
            WHERE id = ${existe[0].id}
          `;
          actualizados++;
        } else {
          omitidos++;
        }
        continue;
      }

      await sql`
        INSERT INTO productos (
          nombre, tienda, precio, antes, descuento,
          categoria, imagen, url, descripcion, entrega, disponible
        )
        VALUES (
          ${o.title},
          ${"eBay"},
          ${o.precio},
          ${o.antes || o.precio},
          ${o.descuento || ""},
          ${detectarCategoria(o.title)},
          ${o.imagen || ""},
          ${url},
          ${o.descripcion || ""},
          ${o.entrega || ""},
          ${true}
        )
      `;
      insertados++;
    }

    return NextResponse.json({ ok: true, insertados, omitidos, actualizados });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}