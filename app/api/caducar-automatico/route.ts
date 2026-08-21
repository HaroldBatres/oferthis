import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";

function autorizado(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("secret") === secret) return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await sql`
      UPDATE productos
      SET disponible = false
      WHERE caduca_en IS NOT NULL
        AND caduca_en < CURRENT_DATE
        AND (disponible = true OR disponible IS NULL)
      RETURNING id, nombre, caduca_en
    `;

    const caducados = result as any[];

    return NextResponse.json({
      ok: true,
      caducados: caducados.length,
      productos: caducados,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Error" },
      { status: 500 }
    );
  }
}