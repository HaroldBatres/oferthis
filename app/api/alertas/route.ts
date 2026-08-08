import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, precioObjetivo } = body;

    if (!productId || !precioObjetivo) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    await sql`
      INSERT INTO alertas_precio (user_id, product_id, precio_objetivo)
      VALUES (${userId}, ${Number(productId)}, ${precioObjetivo})
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET precio_objetivo = ${precioObjetivo}, activa = true
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear alerta" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ alertas: [] });
    }

    const alertas = await sql`
      SELECT * FROM alertas_precio WHERE user_id = ${userId} AND activa = true
    ` as any;

    return NextResponse.json({ alertas });
  } catch (error) {
    return NextResponse.json({ alertas: [] });
  }
}