import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "../../lib/db";

const APP_KEY =
  process.env.ALIEXPRESS_APP_KEY ||
  process.env.AE_APP_KEY ||
  process.env.ALI_APP_KEY ||
  "";
const APP_SECRET =
  process.env.ALIEXPRESS_APP_SECRET ||
  process.env.AE_APP_SECRET ||
  process.env.ALI_APP_SECRET ||
  "";
const TRACKING_ID =
  process.env.ALIEXPRESS_TRACKING_ID ||
  process.env.AE_TRACKING_ID ||
  process.env.ALI_TRACKING_ID ||
  "";

const API_URL = "https://api-sg.aliexpress.com/sync";

const BUSQUEDAS = [
  { q: "auriculares bluetooth", categoria: "Tecnologia" },
  { q: "powerbank", categoria: "Tecnologia" },
  { q: "hub usb c", categoria: "Tecnologia" },
  { q: "smartwatch", categoria: "Tecnologia" },
  { q: "cargador movil", categoria: "Tecnologia" },
  { q: "aspiradora de mesa", categoria: "Hogar" },
  { q: "organizador nevera", categoria: "Hogar" },
  { q: "lampara led escritorio", categoria: "Hogar" },
  { q: "difusor aromas", categoria: "Hogar" },
  { q: "silla gaming", categoria: "Gaming" },
  { q: "teclado gaming", categoria: "Gaming" },
  { q: "raton gaming", categoria: "Gaming" },
  { q: "auriculares gaming", categoria: "Gaming" },
  { q: "banda resistencia", categoria: "Deporte" },
  { q: "esterilla yoga", categoria: "Deporte" },
  { q: "botella deportiva", categoria: "Deporte" },
  { q: "guantes gimnasio", categoria: "Deporte" },
  { q: "freidora aire", categoria: "Cocina" },
  { q: "termo cocina", categoria: "Cocina" },
  { q: "set cuchillos cocina", categoria: "Cocina" },
  { q: "bascula cocina", categoria: "Cocina" },
  { q: "bolso mujer", categoria: "Moda" },
  { q: "gafas de sol", categoria: "Moda" },
  { q: "reloj mujer", categoria: "Moda" },
  { q: "cinturon hombre", categoria: "Moda" },
  { q: "plancha pelo", categoria: "Belleza" },
  { q: "maquillaje set", categoria: "Belleza" },
  { q: "crema facial", categoria: "Belleza" },
  { q: "depiladora electrica", categoria: "Belleza" },
  { q: "arnes perro", categoria: "Mascotas" },
  { q: "juguete gato", categoria: "Mascotas" },
  { q: "comedero automatico mascota", categoria: "Mascotas" },
  { q: "cama para perro", categoria: "Mascotas" },
  { q: "sensor presion neumaticos", categoria: "Automocion" },
  { q: "luces led coche", categoria: "Automocion" },
  { q: "organizador maletero", categoria: "Automocion" },
  { q: "soporte movil coche", categoria: "Automocion" },
  { q: "taladro inalambrico", categoria: "Herramientas" },
  { q: "set destornilladores", categoria: "Herramientas" },
  { q: "caja herramientas", categoria: "Herramientas" },
  { q: "nivel laser", categoria: "Herramientas" },
];

function sign(params: Record<string, string>) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  const raw = `${APP_SECRET}${sorted}${APP_SECRET}`;
  return crypto.createHash("md5").update(raw, "utf8").digest("hex").toUpperCase();
}

function precioEs(n: string | number) {
  const x = Number(String(n).replace(",", "."));
  if (!Number.isFinite(x)) return String(n);
  return x.toFixed(2).replace(".", ",") + "€";
}

async function buscarAli(keywords: string) {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  const params: Record<string, string> = {
    method: "aliexpress.affiliate.product.query",
    app_key: APP_KEY,
    timestamp,
    sign_method: "md5",
    v: "2.0",
    format: "json",
    keywords,
    page_no: "1",
    page_size: "20",
    sort: "LAST_VOLUME_DESC",
    target_currency: "EUR",
    target_language: "ES",
    ship_to_country: "ES",
    tracking_id: TRACKING_ID,
  };
  params.sign = sign(params);

  const url = `${API_URL}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  return res.json();
}

function extraerProductos(data: any): any[] {
  const r =
    data?.aliexpress_affiliate_product_query_response?.resp_result?.result
      ?.products?.product ||
    data?.resp_result?.result?.products?.product ||
    data?.resp_result?.result?.products ||
    [];
  return Array.isArray(r) ? r : r ? [r] : [];
}

export async function GET() {
  try {
    if (!APP_KEY || !APP_SECRET) {
      return NextResponse.json(
        {
          error:
            "No encuentro ALIEXPRESS_APP_KEY / ALIEXPRESS_APP_SECRET en .env.local",
        },
        { status: 500 }
      );
    }

    let insertados = 0;
    let actualizados = 0;

    for (const b of BUSQUEDAS) {
            const data = await buscarAli(b.q);
      const items = extraerProductos(data).slice(0, 20);
      await new Promise((r) => setTimeout(r, 350));

      for (const item of items) {
        const nombre = String(item.product_title || item.title || "").slice(0, 180);
        if (!nombre) continue;

        const venta = item.target_sale_price || item.app_sale_price || item.sale_price;
        const original = item.target_original_price || item.original_price || venta;
        const precio = precioEs(venta);
        const antes = precioEs(original);
        const descRaw = String(item.discount || "").replace("-", "");
        const descuento = descRaw.includes("%")
          ? `-${descRaw.replace("%", "")}%`
          : "-0%";
        const imagen =
          item.product_main_image_url ||
          item.image_url ||
          item.product_small_image_urls?.string?.[0] ||
          "";
        const url = item.promotion_link || item.product_detail_url || "";

        const existe = (await sql`
          SELECT id FROM productos
          WHERE tienda = 'AliExpress' AND nombre = ${nombre}
          LIMIT 1
        `) as any[];

        if (existe[0]) {
          await sql`
            UPDATE productos SET
              precio = ${precio},
              antes = ${antes},
              descuento = ${descuento},
              imagen = ${imagen},
              url = ${url},
              disponible = true,
              ultima_actualizacion = ${"Ali sync " + new Date().toISOString()}
            WHERE id = ${existe[0].id}
          `;
          actualizados++;
        } else {
          await sql`
            INSERT INTO productos (
              nombre, tienda, precio, antes, descuento, categoria,
              imagen, url, disponible, ultima_actualizacion
            ) VALUES (
              ${nombre},
              'AliExpress',
              ${precio},
              ${antes},
              ${descuento},
              ${b.categoria},
              ${imagen},
              ${url},
              true,
              ${"Ali sync " + new Date().toISOString()}
            )
          `;
          insertados++;
        }
      }
    }

        const prueba = await buscarAli("auriculares bluetooth");

    return NextResponse.json({
      ok: true,
      insertados,
      actualizados,
      prueba,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}