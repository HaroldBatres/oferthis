import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

const BUSQUEDAS = [
  { q: "zapatillas hombre oferta", categoria: "Moda" },
  { q: "sudadera hombre", categoria: "Moda" },
  { q: "jeans hombre", categoria: "Moda" },
  { q: "camiseta deporte hombre", categoria: "Deporte" },
  { q: "auriculares bluetooth", categoria: "Tecnologia" },
];

function dinero(n: unknown) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "";
  return x.toFixed(2).replace(".", ",") + "€";
}

export async function POST() {
  try {
    const clientId = process.env.AMAZON_CLIENT_ID || "";
    const clientSecret = process.env.AMAZON_CLIENT_SECRET || "";
    const version = process.env.AMAZON_CREDENTIAL_VERSION || "3.2";
    const partnerTag = process.env.AMAZON_PARTNER_TAG || "haroldmaurici-21";
    const marketplace = process.env.AMAZON_MARKETPLACE || "www.amazon.es";

    if (!clientId || !clientSecret || !partnerTag) {
      return NextResponse.json(
        { ok: false, error: "Faltan claves Amazon en .env.local" },
        { status: 500 }
      );
    }

    const tokenRes = await fetch("https://api.amazon.co.uk/auth/o2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "creatorsapi::default",
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return NextResponse.json({
        ok: false,
        error: "Sin token",
        detalles: tokenJson,
      });
    }

    let insertados = 0;
    let actualizados = 0;
    const errores: string[] = [];

    for (const b of BUSQUEDAS) {
      const res = await fetch(
        "https://creatorsapi.amazon/catalog/v1/searchItems",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
            "Content-Type": "application/json",
            "x-marketplace": marketplace,
            "x-credential-version": version,
          },
          body: JSON.stringify({
            keywords: b.q,
            marketplace,
            partnerTag,
            partnerType: "Associates",
            itemCount: 8,
            resources: [
              "itemInfo.title",
              "images.primary.medium",
              "offersV2.listings.price",
            ],
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        errores.push(
          `${b.q}: ${String(data.message || JSON.stringify(data)).slice(0, 160)}`
        );
        continue;
      }

      const items =
        data.items ||
        data.searchResult?.items ||
        data.SearchResult?.Items ||
        [];

      for (const item of items) {
        const nombre = item.itemInfo?.title?.displayValue || "";
        if (!nombre) continue;

        const listing = item.offersV2?.listings?.[0] || {};
        const amount = listing.price?.money?.amount ?? listing.price?.amount;
        if (amount == null) continue;

        const precio = dinero(amount);
        const imagen =
          item.images?.primary?.medium?.url ||
          item.images?.primary?.large?.url ||
          "";
        const asin = item.asin || item.ASIN || "";
        const url =
          item.detailPageURL ||
          `https://www.amazon.es/dp/${asin}?tag=${partnerTag}`;

        const existe = (await sql`
          SELECT id FROM productos
          WHERE tienda = 'Amazon' AND nombre = ${nombre}
          LIMIT 1
        `) as any[];

        if (existe[0]) {
          await sql`
            UPDATE productos SET
              precio = ${precio},
              imagen = COALESCE(NULLIF(${imagen}, ''), imagen),
              url = ${url},
              categoria = ${b.categoria},
              disponible = true
            WHERE id = ${existe[0].id}
          `;
          actualizados++;
        } else {
          await sql`
            INSERT INTO productos (
              nombre, tienda, precio, descuento, categoria,
              imagen, url, disponible
            ) VALUES (
              ${nombre}, 'Amazon', ${precio}, '',
              ${b.categoria}, ${imagen}, ${url}, true
            )
          `;
          insertados++;
        }
      }
    }

    return NextResponse.json({ ok: true, insertados, actualizados, errores });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}