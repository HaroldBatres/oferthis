import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;

  if (!appId || !certId) {
    return NextResponse.json(
      { error: "Faltan EBAY_APP_ID o EBAY_CERT_ID en .env.local" },
      { status: 500 }
    );
  }

  const tokenUrl = "https://api.sandbox.ebay.com/identity/v1/oauth2/token";
  const credentials = Buffer.from(`${appId}:${certId}`).toString("base64");

  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error al pedir token a eBay", detalles: data },
        { status: res.status }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Conexión con eBay Sandbox correcta",
      token_type: data.token_type,
      expires_in: data.expires_in,
      access_token_preview: data.access_token
        ? data.access_token.slice(0, 20) + "..."
        : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error de red", detalles: err?.message },
      { status: 500 }
    );
  }
}