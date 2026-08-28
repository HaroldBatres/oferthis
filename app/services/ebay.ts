const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_BASE = "https://api.ebay.com/buy/browse/v1";

function getCredentials() {
  const clientId =
    process.env.EBAY_CLIENT_ID || process.env.EBAY_APP_ID;
  const clientSecret =
    process.env.EBAY_CLIENT_SECRET || process.env.EBAY_CERT_ID;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan EBAY_APP_ID/EBAY_CERT_ID (o EBAY_CLIENT_ID/EBAY_CLIENT_SECRET) en .env.local"
    );
  }
  return { clientId, clientSecret };
}

/** Extrae el ID del anuncio desde una URL de eBay */
export function extractEbayItemId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/itm\/(?:[^/]+\/)?(\d{9,15})/);
  if (match) return match[1];
  const onlyDigits = url.match(/(\d{9,15})/);
  return onlyDigits ? onlyDigits[1] : null;
}

async function getAppToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token eBay falló: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export type EbayItemDetails = {
  title: string;
  descripcion: string;
  caracteristicas: string;
};

function cleanEbayHtml(html: string): string {
  if (!html) return "";

  let text = html;

  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");

  text = text.replace(
    /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi,
    (_m, inner: string) => {
      const t = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return t ? `\n\n### ${t}\n\n` : "\n\n";
    }
  );

  text = text.replace(
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
    (_m, inner: string) => {
      const t = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return t ? `\n- ${t}` : "";
    }
  );

  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<[^>]+>/g, " ");

  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  text = text.replace(/@font-face[\s\S]*?\}/gi, " ");
  text = text.replace(/@media[^{]+\{[\s\S]*?\}\s*\}/gi, " ");
  text = text.replace(/\{[^}]*\}/g, " ");

  text = text
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();

  const titleHints = [
    /^(Comedero .+ en detalle)$/i,
    /^(Comedero ergonómico.+)$/i,
    /^(Contenido del envío)$/i,
    /^(Detalles?)$/i,
    /^(Características)$/i,
  ];

  text = text
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ") || line.startsWith("- ")) return line;
      for (const re of titleHints) {
        if (re.test(line)) return `### ${line}`;
      }
      if (
        line.length > 8 &&
        line.length < 80 &&
        !line.includes(".") &&
        /^[A-ZÁÉÍÓÚÑ]/.test(line)
      ) {
        return `### ${line}`;
      }
      return line;
    })
    .join("\n");

  const MAX = 4000;
  if (text.length > MAX) {
    text = text.slice(0, MAX).trim() + "…";
  }

  return text;
}

function mapEbayItem(data: any): EbayItemDetails {
  const title = String(data?.title || "");

  let descripcion = "";
  if (typeof data?.description === "string") {
    descripcion = cleanEbayHtml(data.description);
  }

  const aspects: string[] = [];
  const list = data?.localizedAspects || data?.aspects || [];
  if (Array.isArray(list)) {
    for (const a of list) {
      const name = a?.name || a?.localizedAspectName;
      const value = Array.isArray(a?.value)
        ? a.value.join(", ")
        : a?.value || a?.localizedAspectValue;
      if (name && value) aspects.push(`${name}: ${value}`);
    }
  }

  const caracteristicas = aspects.join("\n");

  return { title, descripcion, caracteristicas };
}

/** Obtiene descripción y características de un ítem eBay */
export async function fetchEbayItemDetails(
  itemIdOrUrl: string
): Promise<EbayItemDetails> {
  const itemId =
    extractEbayItemId(itemIdOrUrl) || itemIdOrUrl.replace(/\D/g, "");
  if (!itemId) {
    throw new Error("No se pudo obtener el ID del anuncio eBay");
  }

  const token = await getAppToken();

  const res = await fetch(`${EBAY_BROWSE_BASE}/item/v1|${itemId}|0`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_ES",
    },
  });

  if (!res.ok) {
    const res2 = await fetch(`${EBAY_BROWSE_BASE}/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_ES",
      },
    });
    if (!res2.ok) {
      const text = await res2.text();
      throw new Error(`Browse eBay falló: ${res.status}/${res2.status} ${text}`);
    }
    return mapEbayItem(await res2.json());
  }

  return mapEbayItem(await res.json());
}

function normalizarPrecioEbay(valor: string | number | null): string | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = typeof valor === "number" ? valor : parseFloat(String(valor).replace(",", "."));
  if (Number.isNaN(n)) return null;
  return n.toFixed(2).replace(".", ",") + "€";
}

export type EbayEstado = {
  existe: boolean;
  precio: string | null;
};

/** Estado del anuncio: existe + precio actual en eBay */
export async function ebayEstadoAnuncio(url: string): Promise<EbayEstado> {
  const itemId = extractEbayItemId(url);
  if (!itemId) return { existe: false, precio: null };

  const token = await getAppToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-EBAY-C-MARKETPLACE-ID": "EBAY_ES",
  };

  let res = await fetch(`${EBAY_BROWSE_BASE}/item/v1|${itemId}|0`, {
    headers,
  });

  if (!res.ok) {
    res = await fetch(`${EBAY_BROWSE_BASE}/item/${itemId}`, { headers });
  }

  if (!res.ok) return { existe: false, precio: null };

  const data = await res.json();
  const qty =
    data?.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity;
  if (qty === 0) return { existe: false, precio: null };

  const raw = data?.price?.value ?? data?.currentBidPrice?.value ?? null;
  return { existe: true, precio: normalizarPrecioEbay(raw) };
}

export async function ebayAnuncioExiste(url: string): Promise<boolean> {
  const estado = await ebayEstadoAnuncio(url);
  return estado.existe;
}