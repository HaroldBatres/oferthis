import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productoId, precioObjetivo } = body;

    if (!productoId || !precioObjetivo) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

        await sql`
      INSERT INTO alertas (user_id, product_id, precio_objetivo)
      VALUES (${userId}, ${productoId}, ${precioObjetivo})
    `;

    return NextResponse.json({ success: true });
    } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Error al crear la alerta" },
      { status: 500 }
    );
  }
}