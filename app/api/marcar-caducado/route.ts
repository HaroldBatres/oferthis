import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el id del producto" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE productos
      SET 
        disponible = false,
        ultima_actualizacion = ${"Oferta caducada"}
      WHERE id = ${Number(id)}
    `;

    return NextResponse.json({
      success: true,
      message: "Producto marcado como caducado",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al marcar el producto" },
      { status: 500 }
    );
  }
}