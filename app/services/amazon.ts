const TOKEN_URL = "https://api.amazon.co.uk/auth/o2/token";
const SEARCH_URL = "https://creatorsapi.amazon/catalog/v1/searchItems";

async function getAccessToken() {
  const clientId = process.env.AMAZON_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Faltan AMAZON_CLIENT_ID o AMAZON_CLIENT_SECRET");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "creatorsapi::default",
  });

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: "grant_type=client_credentials&scope=creatorsapi%3A%3Adefault",
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(JSON.stringify(data));
  }

  return data.access_token as string;
}

export async function searchAmazon(keywords: string) {
  const token = await getAccessToken();
  const partnerTag = process.env.AMAZON_PARTNER_TAG || "";

  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-marketplace": "www.amazon.es",
    },
    body: JSON.stringify({
      partnerTag,
      keywords,
      itemCount: 3,
      resources: [
        "itemInfo.title",
        "images.primary.large",
        "offersV2.listings.price",
      ],
    }),
  });

  const data = await res.json();
  return { status: res.status, data };
}