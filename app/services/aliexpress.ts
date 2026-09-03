import crypto from "crypto";

const API_URL = "https://api-sg.aliexpress.com/sync";

function sign(params: Record<string, string>, secret: string) {
  const sorted = Object.keys(params).sort();
  let str = secret;
  for (const key of sorted) {
    str += key + params[key];
  }
  str += secret;
  return crypto.createHash("md5").update(str, "utf8").digest("hex").toUpperCase();
}

export async function searchAliExpress(keywords: string) {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID;

  if (!appKey || !appSecret || !trackingId) {
    throw new Error(
      "Faltan ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET o ALIEXPRESS_TRACKING_ID"
    );
  }

  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

  const params: Record<string, string> = {
    method: "aliexpress.affiliate.product.query",
    app_key: appKey,
    sign_method: "md5",
    timestamp,
    format: "json",
    v: "2.0",
    keywords,
    page_no: "1",
    page_size: "20",
    tracking_id: trackingId,
    target_currency: "EUR",
    target_language: "ES",
    ship_to_country: "ES",
  };

  params.sign = sign(params, appSecret);

  const url = API_URL + "?" + new URLSearchParams(params).toString();
  const res = await fetch(url);
  const data = await res.json();
  return { status: res.status, data };
}

export async function getAliExpressByIds(ids: string[]) {
  const appKey = process.env.ALIEXPRESS_APP_KEY!;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET!;
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID!;

  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

  const params: Record<string, string> = {
    method: "aliexpress.affiliate.productdetail.get",
    app_key: appKey,
    sign_method: "md5",
    timestamp,
    format: "json",
    v: "2.0",
    product_ids: ids.join(","),
    tracking_id: trackingId,
    target_currency: "EUR",
    target_language: "ES",
    ship_to_country: "ES",
  };

  params.sign = sign(params, appSecret);

  const url = API_URL + "?" + new URLSearchParams(params).toString();
  const res = await fetch(url);
  return res.json();
}

export function extraerIdAliExpress(url: string) {
  if (!url) return "";
  const m = url.match(/\/item\/(\d+)/) || url.match(/(\d{13,})/);
  return m ? m[1] : "";
}