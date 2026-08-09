const clientId = process.env.AMAZON_CLIENT_ID!;
const clientSecret = process.env.AMAZON_CLIENT_SECRET!;
const partnerTag = process.env.AMAZON_PARTNER_TAG!;

export const amazonConfig = {
  clientId,
  clientSecret,
  partnerTag,
  marketplace: "www.amazon.es",
  tokenUrl: "https://api.amazon.co.uk/auth/o2/token", // Europa / España → v3.2
  apiBase: "https://creatorsapi.amazon",
};

export function isAmazonConfigured(): boolean {
  return Boolean(clientId && clientSecret && partnerTag);
}

export async function getAmazonAccessToken(): Promise<string> {
  const res = await fetch(amazonConfig.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "creatorsapi::default",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Error al obtener token: ${JSON.stringify(data)}`
    );
  }

  return data.access_token;
}

export async function getAmazonItem(asin: string) {
  const token = await getAmazonAccessToken();

  const res = await fetch(`${amazonConfig.apiBase}/catalog/v1/getItems`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-marketplace": amazonConfig.marketplace,
    },
    body: JSON.stringify({
      itemIds: [asin],
      itemIdType: "ASIN",
      marketplace: amazonConfig.marketplace,
      partnerTag: partnerTag,
            resources: [
        "itemInfo.title",
        "offersV2.listings.price",
        "images.primary.large",
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Error al obtener producto: ${JSON.stringify(data)}`
    );
  }

  return data;
}