import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";

import { requireAdmin } from "../../lib/requireAdmin";

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el id del producto" },
        { status: 400 }
      );
    }

    await sql`DELETE FROM productos WHERE id = ${Number(id)}`;

    return NextResponse.json({
      success: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}