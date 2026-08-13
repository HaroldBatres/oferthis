import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta el id" }, { status: 400 });
    }

    await sql`
      UPDATE productos
      SET disponible = false
      WHERE id = ${Number(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Error al marcar producto" },
      { status: 500 }
    );
  }
}