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

function extractEbayItemId(url: string): string | null {
  const u = String(url || "");
  let m = u.match(/\/itm\/(?:[^/?#]+\/)?(\d{9,15})/i);
  if (m) return m[1];
  m = u.match(/[?&]item=(\d{9,15})/i);
  if (m) return m[1];
  m = u.match(/v1\|(\d{9,15})\|/i);
  if (m) return m[1];
  return null;
}

/** Solo caduca si AMBOS endpoints responden 404 */
async function fetchEbayItem(token: string, itemId: string) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "X-EBAY-C-MARKETPLACE-ID": "EBAY_ES",
    "Content-Type": "application/json",
  };

  const res1 = await fetch(
    `https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${itemId}`,
    { headers }
  );
  if (res1.ok) return { res: res1, ambos404: false };

  const encodedId = encodeURIComponent(`v1|${itemId}|0`);
  const res2 = await fetch(
    `https://api.ebay.com/buy/browse/v1/item/${encodedId}`,
    { headers }
  );
  if (res2.ok) return { res: res2, ambos404: false };

  const ambos404 = res1.status === 404 && res2.status === 404;
  return { res: res2.status === 404 ? res2 : res1, ambos404 };
}

export async function GET() {
  try {
    const token = await getEbayToken();

    const productos = (await sql`
      SELECT id, nombre, precio, antes, descuento, url
      FROM productos
      WHERE tienda = 'eBay'
        AND (disponible = true OR disponible IS NULL)
        AND url IS NOT NULL
        AND url ILIKE '%/itm/%'
        AND url NOT ILIKE '%sandbox.ebay%'
      ORDER BY id
      LIMIT 30
    `) as any[];

    let actualizados = 0;
    let caducados = 0;
    let sinCambios = 0;
    let errores = 0;
    const detalle: any[] = [];

    for (const p of productos) {
      const itemId = extractEbayItemId(p.url);
      if (!itemId) {
        errores++;
        detalle.push({ id: p.id, estado: "error", motivo: "sin itemId" });
        continue;
      }

      try {
        const { res, ambos404 } = await fetchEbayItem(token, itemId);

               // No caducamos por API: muchos 404 son falsos positivos.
        // Agotado solo desde el admin (manual).
        if (ambos404 || !res.ok) {
          errores++;
          detalle.push({
            id: p.id,
            estado: "error",
            itemId,
            http: res.status,
            nota: "no se marca agotado",
          });
          continue;
        }

        if (!res.ok) {
          errores++;
          detalle.push({
            id: p.id,
            estado: "error",
            itemId,
            http: res.status,
            nota: "no se caduca",
          });
          continue;
        }

        const data = await res.json();
        const precioValor = parseFloat(data.price?.value || "0");
        if (!precioValor) {
          errores++;
          detalle.push({ id: p.id, estado: "error", motivo: "sin precio" });
          continue;
        }

        const moneda = data.price?.currency || "EUR";
        const precio = `${data.price.value}${
          moneda === "EUR" ? "€" : " " + moneda
        }`;

        const originalValor = parseFloat(
          data.marketingPrice?.originalPrice?.value || "0"
        );

        let antes = p.antes || precio;
        let descuento = p.descuento || "-0%";

        if (originalValor > precioValor && precioValor > 0) {
          const pct = Math.round(
            ((originalValor - precioValor) / originalValor) * 100
          );
          if (pct >= 1) {
            antes = `${data.marketingPrice.originalPrice.value}${
              moneda === "EUR" ? "€" : " " + moneda
            }`;
            descuento = `-${pct}%`;
          }
        }

        if (precio !== p.precio || descuento !== p.descuento) {
          const fecha = new Date().toLocaleDateString("es-ES");
          const entrada = JSON.stringify([{ fecha, precio }]);

          await sql`
            UPDATE productos SET
              precio = ${precio},
              antes = ${antes},
              descuento = ${descuento},
              disponible = true,
              ultima_actualizacion = ${
                "Precio auto " + new Date().toISOString()
              },
              historial_precios = COALESCE(historial_precios, '[]'::jsonb)
                || ${entrada}::jsonb
            WHERE id = ${p.id}
          `;
          actualizados++;
          detalle.push({
            id: p.id,
            estado: "actualizado",
            de: p.precio,
            a: precio,
          });
        } else {
          sinCambios++;
        }
      } catch (e: any) {
        errores++;
        detalle.push({
          id: p.id,
          estado: "error",
          motivo: e?.message || "exception",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      revisados: productos.length,
      actualizados,
      caducados,
      sinCambios,
      errores,
      detalle,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Error" },
      { status: 500 }
    );
  }
}