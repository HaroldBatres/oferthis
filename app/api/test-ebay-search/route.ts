import { NextRequest, NextResponse } from "next/server";
import { searchEbayOfertas } from "../../services/ebay";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "freidora";

  try {
    const ofertas = await searchEbayOfertas(q, 5);
    return NextResponse.json({
      ok: true,
      q,
      total: ofertas.length,
      ofertas,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Error búsqueda eBay" },
      { status: 500 }
    );
  }
}