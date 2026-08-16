import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

async function getEbayToken() {
  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;

  if (!appId || !certId) {
    throw new Error("Faltan EBAY_APP_ID o EBAY_CERT_ID");
  }

  const credentials = Buffer.from(`${appId}:${certId}`).toString("base64");

  const res = await fetch(
    "https://api.ebay.com/identity/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.access_token as string;
}

// Búsquedas → categoría en Oferthis
const BUSQUEDAS = [
  { q: "auriculares", categoria: "Tecnología" },
  { q: "portatil", categoria: "Tecnología" },
  { q: "raton gaming", categoria: "Gaming" },
  { q: "robot aspirador", categoria: "Hogar" },
  { q: "zapatillas running", categoria: "Deporte" },
];

export async function GET() {
  try {
    const token = await getEbayToken();

    let insertados = 0;
    let actualizados = 0;
    let marcadosNoDisponibles = 0;
    let encontradosTotal = 0;

    const titulosVivos = new Set<string>();

    for (const busqueda of BUSQUEDAS) {
      const searchUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(busqueda.q)}&limit=5`;

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
        titulosVivos.add(nombre);

                 const precioValor = item.price?.value || "0";
        const moneda = item.price?.currency || "EUR";
        const precio = `${precioValor}${moneda === "EUR" ? "€" : " " + moneda}`;
        const imagenRaw =
          item.image?.imageUrl ||
          item.thumbnailImages?.[0]?.imageUrl ||
          "https://picsum.photos/400/400";
        const imagen = String(imagenRaw).replace(/s-l\d+/gi, "s-l1600");
        const url = item.itemWebUrl || "https://www.ebay.es";
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
              imagen = ${imagen},
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
              imagen, url, disponible, ultima_actualizacion
            ) VALUES (
              ${nombre},
              'eBay',
              ${precio},
              ${precio},
              '-0%',
              ${busqueda.categoria},
              ${imagen},
              ${url},
              true,
              ${"Sincronizado " + ahora}
            )
          `;
          insertados++;
        }
      }
    }

    // Marcar no disponibles los eBay que ya no salen en ninguna búsqueda
    const ebayProductos = await sql`
      SELECT id, nombre FROM productos
      WHERE tienda = 'eBay' AND disponible = true
    `;

    for (const p of ebayProductos as any[]) {
      if (!titulosVivos.has(p.nombre)) {
        await sql`
          UPDATE productos SET
            disponible = false,
            ultima_actualizacion = ${"Caducado auto " + new Date().toISOString()}
          WHERE id = ${p.id}
        `;
        marcadosNoDisponibles++;
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Sincronización eBay Production (ES) finalizada",
      busquedas: BUSQUEDAS.length,
      encontrados_en_ebay: encontradosTotal,
      insertados,
      actualizados,
      marcados_no_disponibles: marcadosNoDisponibles,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Fallo en sincronizar-ebay", detalles: err?.message },
      { status: 500 }
    );
  }
}