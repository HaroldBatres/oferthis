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
    "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
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
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.access_token as string;
}

export async function GET() {
  try {
    const token = await getEbayToken();

    // Búsqueda de prueba en Sandbox (cambiar q= por otra palabra si quieres)
    const q = "headphones";
    const searchUrl = `https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(q)}&limit=10`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "Content-Type": "application/json",
      },
    });

    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      return NextResponse.json(
        { error: "Error al buscar en eBay", detalles: searchData },
        { status: searchRes.status }
      );
    }

    const items = searchData.itemSummaries || [];
    let insertados = 0;
    const errores: string[] = [];

    for (const item of items) {
      try {
        const nombre = item.title || "Sin título";
        const precioValor = item.price?.value || "0";
        const moneda = item.price?.currency || "USD";
        const precio = `${precioValor} ${moneda}`;
        const imagen =
          item.image?.imageUrl ||
          item.thumbnailImages?.[0]?.imageUrl ||
          "https://picsum.photos/400/400";
        const url = item.itemWebUrl || item.itemHref || "https://www.ebay.com";
        const ebayId = item.itemId || item.legacyItemId || null;

        // Evitar duplicados por nombre + tienda (simple para Sandbox)
        const existentes = await sql`
          SELECT id FROM productos
          WHERE nombre = ${nombre} AND tienda = 'eBay'
          LIMIT 1
        `;

        if (existentes.length > 0) {
          continue;
        }

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
            'Tecnología',
            ${imagen},
            ${url},
            true,
            ${"Importado de eBay " + new Date().toISOString()}
          )
        `;
        insertados++;
      } catch (e: any) {
        errores.push(e?.message || "Error al insertar un ítem");
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Importación eBay Sandbox finalizada",
      encontrados: items.length,
      insertados,
      errores: errores.slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Fallo en importar-ebay", detalles: err?.message },
      { status: 500 }
    );
  }
}