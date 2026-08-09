import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Falta el id del producto" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE productos
      SET disponible = false
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al caducar el producto" },
      { status: 500 }
    );
  }
}