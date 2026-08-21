import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
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

    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      null;

    if (!email) {
      return NextResponse.json(
        { error: "No se pudo obtener tu email" },
        { status: 400 }
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
      INSERT INTO alertas (user_id, product_id, precio_objetivo, email, notificada)
      VALUES (${userId}, ${productoId}, ${precioObjetivo}, ${email}, false)
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