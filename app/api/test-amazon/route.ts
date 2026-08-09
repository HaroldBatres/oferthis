import { NextResponse } from "next/server";
import { getAmazonItem, isAmazonConfigured } from "../../services/amazon";

export async function GET() {
  try {
    if (!isAmazonConfigured()) {
      return NextResponse.json(
        { error: "Amazon no está configurado" },
        { status: 500 }
      );
    }

    // ASIN de ejemplo (AirPods Pro en Amazon.es)
    const data = await getAmazonItem("B0CHWRXH8B");

    return NextResponse.json({
      ok: true,
      message: "Respuesta de Amazon recibida",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}