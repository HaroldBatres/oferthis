import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

async function getEbayToken() {
  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;

  if (!appId || !certId) {
    throw new Error("Faltan EBAY_APP_ID o EBAY_CERT_ID");
  }

  const credentials = Buffer.from(`${appId}:${certId}`).toString("base64");

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.access_token as string;
}

function toLargeEbayUrl(url: string) {
  return String(url).replace(/s-l\d+/gi, "s-l1600");
}

async function getEbayItemImages(
  token: string,
  itemId: string
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.ebay.com/buy/browse/v1/item/${encodeURIComponent(itemId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_ES",
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const urls = new Set<string>();

    if (data.image?.imageUrl) {
      urls.add(toLargeEbayUrl(data.image.imageUrl));
    }
    if (Array.isArray(data.additionalImages)) {
      for (const img of data.additionalImages) {
        if (img?.imageUrl) urls.add(toLargeEbayUrl(img.imageUrl));
      }
    }
    if (Array.isArray(data.thumbnailImages)) {
      for (const img of data.thumbnailImages) {
        if (img?.imageUrl) urls.add(toLargeEbayUrl(img.imageUrl));
      }
    }

    return Array.from(urls);
  } catch {
    return [];
  }
}

const BUSQUEDAS = [
  { q: "sudadera hombre", categoria: "Moda" },
  { q: "sudadera mujer", categoria: "Moda" },
  { q: "hoodie hombre", categoria: "Moda" },
  { q: "hoodie mujer", categoria: "Moda" },
  { q: "abrigo hombre", categoria: "Moda" },
  { q: "abrigo mujer", categoria: "Moda" },
  { q: "chaqueta hombre otoño", categoria: "Moda" },
  { q: "chaqueta mujer otoño", categoria: "Moda" },
  { q: "jersey hombre", categoria: "Moda" },
  { q: "jersey mujer", categoria: "Moda" },
  { q: "cazadora hombre", categoria: "Moda" },
  { q: "plumifero mujer", categoria: "Moda" },
  { q: "zapatos hombre", categoria: "Moda" },
  { q: "zapatos mujer", categoria: "Moda" },
  { q: "zapatillas mujer", categoria: "Moda" },
  { q: "botas hombre", categoria: "Moda" },
  { q: "botas mujer", categoria: "Moda" },
  { q: "disfraz halloween", categoria: "Moda" },
  { q: "decoracion halloween", categoria: "Hogar" },
  { q: "calabaza led halloween", categoria: "Hogar" },
  { q: "luces halloween", categoria: "Hogar" },
  { q: "portatil", categoria: "Tecnologia" },
  { q: "smartphone", categoria: "Tecnologia" },
  { q: "auriculares bluetooth", categoria: "Tecnologia" },
  { q: "tablet", categoria: "Tecnologia" },
  { q: "smartwatch", categoria: "Tecnologia" },
  { q: "monitor", categoria: "Tecnologia" },
  { q: "robot aspirador", categoria: "Hogar" },
  { q: "aspiradora", categoria: "Hogar" },
  { q: "humidificador", categoria: "Hogar" },
  { q: "ventilador", categoria: "Hogar" },
  { q: "lampara led", categoria: "Hogar" },
  { q: "organizador hogar", categoria: "Hogar" },
  { q: "playstation", categoria: "Gaming" },
  { q: "xbox", categoria: "Gaming" },
  { q: "raton gaming", categoria: "Gaming" },
  { q: "teclado mecanico", categoria: "Gaming" },
  { q: "mando consola", categoria: "Gaming" },
  { q: "silla gaming", categoria: "Gaming" },
  { q: "zapatillas running", categoria: "Deporte" },
  { q: "zapatillas deporte", categoria: "Deporte" },
  { q: "bicicleta", categoria: "Deporte" },
  { q: "cinta de correr", categoria: "Deporte" },
  { q: "mancuernas", categoria: "Deporte" },
  { q: "freidora aire", categoria: "Cocina" },
  { q: "cafetera", categoria: "Cocina" },
  { q: "batidora", categoria: "Cocina" },
  { q: "olla a presion", categoria: "Cocina" },
  { q: "vajilla", categoria: "Cocina" },
  { q: "zapatillas hombre", categoria: "Moda" },
  { q: "mochila", categoria: "Moda" },
  { q: "chaqueta hombre", categoria: "Moda" },
  { q: "bolso mujer", categoria: "Moda" },
  { q: "gafas de sol", categoria: "Moda" },
  { q: "secador pelo", categoria: "Belleza" },
  { q: "plancha pelo", categoria: "Belleza" },
  { q: "maquillaje", categoria: "Belleza" },
  { q: "depiladora", categoria: "Belleza" },
  { q: "comedero perro", categoria: "Mascotas" },
  { q: "juguete gato", categoria: "Mascotas" },
  { q: "arnes perro", categoria: "Mascotas" },
  { q: "transportin mascota", categoria: "Mascotas" },
  { q: "accesorios coche", categoria: "Automocion" },
  { q: "sensor presion neumaticos", categoria: "Automocion" },
  { q: "luces led coche", categoria: "Automocion" },
  { q: "cargador coche", categoria: "Automocion" },
  { q: "alfombrillas coche", categoria: "Automocion" },
  { q: "funda volante", categoria: "Automocion" },
  { q: "camara marcha atras coche", categoria: "Automocion" },
  { q: "soporte movil coche", categoria: "Automocion" },
  { q: "taladro", categoria: "Herramientas" },
  { q: "destornillador electrico", categoria: "Herramientas" },
  { q: "caja herramientas", categoria: "Herramientas" },
  { q: "llave inglesa", categoria: "Herramientas" },
  { q: "sierra electrica", categoria: "Herramientas" },
  { q: "amoladora", categoria: "Herramientas" },
  { q: "nivel laser", categoria: "Herramientas" },
  { q: "pistola calor", categoria: "Herramientas" },
];

export async function GET() {
  try {
    const token = await getEbayToken();

    let insertados = 0;
    let actualizados = 0;
    let omitidos = 0;
    let marcadosNoDisponibles = 0;
    let encontradosTotal = 0;

    const titulosVivos = new Set<string>();

    for (const busqueda of BUSQUEDAS) {
      const searchUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
        busqueda.q
      )}&limit=50`;

      const searchRes = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_ES",
          "Content-Type": "application/json",
        },
      });

      const searchData = await searchRes.json();
      if (!searchRes.ok) continue;

      const items = searchData.itemSummaries || [];
      encontradosTotal += items.length;

      for (const item of items) {
        const nombre = item.title || "Sin título";

        const url = String(item.itemWebUrl || "");
        if (!url || !url.includes("/itm/")) {
          omitidos++;
          continue;
        }

        if (
          url.includes("ebay.co.uk") ||
          url.includes("ebay.com/") ||
          url.includes("ebay.de")
        ) {
          omitidos++;
          continue;
        }

        const precioValor = parseFloat(item.price?.value || "0");
        const moneda = String(item.price?.currency || "EUR").toUpperCase();

        if (moneda !== "EUR") {
          omitidos++;
          continue;
        }

        const precio = `${item.price?.value || "0"}€`;

        const originalValor = parseFloat(
          item.marketingPrice?.originalPrice?.value ||
            item.marketingPrice?.price?.value ||
            "0"
        );

        let antes = precio;
        let descuento = "-0%";

        if (originalValor > precioValor && precioValor > 0) {
          const pct = Math.round(
            ((originalValor - precioValor) / originalValor) * 100
          );
          if (pct >= 5 && pct <= 70) {
            antes = `${item.marketingPrice?.originalPrice?.value || originalValor}€`;
            descuento = `-${pct}%`;
          }
        }

        const esRopaOtono =
          /sudadera|hoodie|abrigo|chaqueta|jersey|cazadora|plumifero|zapato|bota/.test(
            busqueda.q
          );
        if (descuento === "-0%" && !esRopaOtono) {
          omitidos++;
          continue;
        }

        const imagenRaw =
          item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || "";
        if (!imagenRaw || String(imagenRaw).includes("picsum")) {
          omitidos++;
          continue;
        }

        let imagen = toLargeEbayUrl(imagenRaw);
        const extrasBusqueda = [
          ...(item.additionalImages || []),
          ...(item.thumbnailImages || []),
        ]
          .map((x: any) => toLargeEbayUrl(x?.imageUrl || ""))
          .filter(Boolean);

        let imagenes: string[] = [imagen, ...extrasBusqueda];

        const itemId = item.itemId || item.legacyItemId;
        if (itemId) {
          const todas = await getEbayItemImages(token, itemId);
          if (todas.length > 0) {
            imagenes = [...imagenes, ...todas];
            imagen = todas[0] || imagen;
          }
        }
        imagenes = [...new Set(imagenes.filter(Boolean))];
        const imagenesJson = JSON.stringify(imagenes);

        titulosVivos.add(nombre);
        const ahora = new Date().toISOString();

        const existentes = await sql`
          SELECT id FROM productos
          WHERE nombre = ${nombre} AND tienda = 'eBay'
          LIMIT 1
        `;

        if (existentes.length > 0) {
          await sql`
            UPDATE productos SET
              precio = ${precio},
              antes = ${antes},
              descuento = ${descuento},
              imagen = ${imagen},
              imagenes = ${imagenesJson}::jsonb,
              url = ${url},
              categoria = ${busqueda.categoria},
              disponible = true,
              ultima_actualizacion = ${"Sincronizado " + ahora}
            WHERE id = ${existentes[0].id}
          `;
          actualizados++;
        } else {
          await sql`
            INSERT INTO productos (
              nombre, tienda, precio, antes, descuento, categoria,
              imagen, imagenes, url, disponible, ultima_actualizacion
            ) VALUES (
              ${nombre},
              'eBay',
              ${precio},
              ${antes},
              ${descuento},
              ${busqueda.categoria},
              ${imagen},
              ${imagenesJson}::jsonb,
              ${url},
              true,
              ${"Sincronizado " + ahora}
            )
          `;
          insertados++;
        }
      }
    }

    await sql`
      UPDATE productos
      SET disponible = false
      WHERE tienda = 'eBay'
        AND (
          precio ILIKE '%GBP%'
          OR url ILIKE '%ebay.co.uk%'
          OR url ILIKE '%ebay.com/%'
        )
    `;

    return NextResponse.json({
      ok: true,
      mensaje: "Sincronización eBay finalizada (solo EUR / ebay.es)",
      busquedas: BUSQUEDAS.length,
      encontrados_en_ebay: encontradosTotal,
      insertados,
      actualizados,
      omitidos,
      marcados_no_disponibles: marcadosNoDisponibles,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Fallo en sincronizar-ebay", detalles: err?.message },
      { status: 500 }
    );
  }
}