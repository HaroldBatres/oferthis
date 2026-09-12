import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { actualizarPrecioProducto } from "../../services/priceUpdater";
import { sql } from "../../lib/db";

function parseNum(texto: unknown) {
  const n = parseFloat(
    String(texto ?? "")
      .replace("€", "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );
  return Number.isFinite(n) ? n : 0;
}

function precioEs(n: number) {
  return n.toFixed(2).replace(".", ",") + "€";
}

function descuentoEs(actual: number, antes: number) {
  if (!(antes > actual && actual > 0)) return "-0%";
  const pct = Math.round(((antes - actual) / antes) * 100);
  return pct >= 1 ? `-${pct}%` : "-0%";
}

function ebayLegacyId(url: string) {
  const m = String(url).match(/\/itm\/(?:[^/?#]+\/)?(\d{9,16})/i);
  return m?.[1] || null;
}

function aliProductId(url: string) {
  const s = String(url);
  return (
    s.match(/\/item\/(\d{6,})/i)?.[1] ||
    s.match(/[?&]product[_-]?id=(\d{6,})/i)?.[1] ||
    s.match(/\/(\d{10,})\.html/i)?.[1] ||
    null
  );
}

async function getEbayToken() {
  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;
  if (!appId || !certId) throw new Error("Faltan EBAY_APP_ID o EBAY_CERT_ID");

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

async function precioEbay(token: string, itemId: string) {
  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${itemId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_ES",
      },
    }
  );
  if (res.status === 404) return { estado: "no_encontrado" as const };
  if (!res.ok) return { estado: "error" as const };
  const data = await res.json();
  const actual = parseNum(data.price?.value);
  const original = parseNum(
    data.marketingPrice?.originalPrice?.value || data.marketingPrice?.price?.value
  );
  if (!(actual > 0)) return { estado: "error" as const };
  return { estado: "ok" as const, actual, original };
}

function signAli(params: Record<string, string>, secret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  return crypto
    .createHash("md5")
    .update(`${secret}${sorted}${secret}`, "utf8")
    .digest("hex")
    .toUpperCase();
}

async function precioAli(productId: string) {
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
  if (!APP_KEY || !APP_SECRET) return { estado: "error" as const };

  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  const params: Record<string, string> = {
    method: "aliexpress.affiliate.product.query",
    app_key: APP_KEY,
    timestamp,
    sign_method: "md5",
    v: "2.0",
    format: "json",
    product_ids: productId,
    target_currency: "EUR",
    target_language: "ES",
    ship_to_country: "ES",
    tracking_id: TRACKING_ID,
  };
  params.sign = signAli(params, APP_SECRET);

  const res = await fetch(
    `https://api-sg.aliexpress.com/sync?${new URLSearchParams(params)}`
  );
  if (!res.ok) return { estado: "error" as const };
  const data = await res.json();
  const raw =
    data?.aliexpress_affiliate_product_query_response?.resp_result?.result
      ?.products?.product ||
    data?.resp_result?.result?.products?.product ||
    [];
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item) return { estado: "no_encontrado" as const };

  const actual = parseNum(
    item.target_sale_price || item.app_sale_price || item.sale_price
  );
  const original = parseNum(
    item.target_original_price || item.original_price || actual
  );
  if (!(actual > 0)) return { estado: "error" as const };
  return { estado: "ok" as const, actual, original };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nuevoPrecio, precioAnterior, descuento } = body;

    if (!id || !nuevoPrecio || !precioAnterior || !descuento) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    await actualizarPrecioProducto(
      Number(id),
      nuevoPrecio,
      precioAnterior,
      descuento
    );

    return NextResponse.json({
      success: true,
      message: "Precio actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar el precio" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
        const authHeader = request.headers.get("authorization")?.replace(/\r/g, "").trim() || "";
    const cronSecret = process.env.CRON_SECRET?.replace(/\r/g, "").trim() || "";
    const key = request.nextUrl.searchParams.get("key")?.trim() || "";

    console.log("[cron]", {
      secretLen: cronSecret.length,
      header: authHeader,
      headerLen: authHeader.length,
      keyLen: key.length,
    });

    const autorizado =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (cronSecret && key === cronSecret);

    if (!autorizado) {
      return NextResponse.json(
        {
          error: "No autorizado",
          secretLen: cronSecret.length,
          headerLen: authHeader.length,
        },
        { status: 401 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productos = (await sql`
      SELECT id, nombre, precio, antes, descuento, url, tienda
      FROM productos
      WHERE (disponible = true OR disponible IS NULL)
        AND (
          tienda ILIKE '%ebay%'
          OR tienda ILIKE '%aliexpress%'
          OR tienda ILIKE '%ali express%'
        )
      ORDER BY id
      LIMIT 80
    `) as any[];

    let ebayToken = "";
    try {
      ebayToken = await getEbayToken();
    } catch {
      ebayToken = "";
    }

    let revisados = 0;
    let actualizados = 0;
    let caducados = 0;
    let omitidos = 0;
    const errores: string[] = [];

    for (const p of productos) {
      revisados++;
      const tienda = String(p.tienda || "").toLowerCase();

      try {
        let live:
          | { estado: "ok"; actual: number; original: number }
          | { estado: "no_encontrado" }
          | { estado: "error" }
          | null = null;

        if (tienda.includes("ebay")) {
          const itemId = ebayLegacyId(p.url || "");
          if (!itemId || !ebayToken) {
            omitidos++;
            continue;
          }
          live = await precioEbay(ebayToken, itemId);
        } else {
          const productId = aliProductId(p.url || "");
          if (!productId) {
            omitidos++;
            continue;
          }
          live = await precioAli(productId);
        }

        if (!live || live.estado === "error") {
          omitidos++;
          continue;
        }

        if (live.estado === "no_encontrado") {
          await sql`
            UPDATE productos
            SET disponible = false,
                ultima_actualizacion = ${"Caducado auto " + new Date().toISOString()}
            WHERE id = ${p.id}
          `;
          caducados++;
          continue;
        }

        const actual = live.actual;
        const original =
          live.original > actual ? live.original : parseNum(p.antes) || actual;
        const nuevoPrecio = precioEs(actual);
        const precioAnterior = precioEs(original);
        const descuento = descuentoEs(actual, original);

        if (
          nuevoPrecio === String(p.precio) &&
          precioAnterior === String(p.antes) &&
          descuento === String(p.descuento)
        ) {
          await sql`
            UPDATE productos
            SET ultima_actualizacion = ${"Revisado API " + new Date().toISOString()}
            WHERE id = ${p.id}
          `;
          continue;
        }

        await actualizarPrecioProducto(
          Number(p.id),
          nuevoPrecio,
          precioAnterior,
          descuento
        );
        actualizados++;
      } catch (e: any) {
        errores.push(`id ${p.id}: ${e?.message || "error"}`);
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: "Cron de precios eBay + AliExpress",
      revisados,
      actualizados,
      caducados,
      omitidos,
      errores: errores.slice(0, 10),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error en el cron de precios" },
      { status: 500 }
    );
  }
}