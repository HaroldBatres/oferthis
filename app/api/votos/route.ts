import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get("producto_id");

    if (!productoId) {
      return NextResponse.json({ error: "Falta producto_id" }, { status: 400 });
    }

    const id = Number(productoId);

    const ups = await sql`
      SELECT COUNT(*)::int as total FROM votos
      WHERE product_id = ${id} AND tipo = 'up'
    `;
    const downs = await sql`
      SELECT COUNT(*)::int as total FROM votos
      WHERE product_id = ${id} AND tipo = 'down'
    `;

    let miVoto = null;
    const { userId } = await auth();
    if (userId) {
      const mio = await sql`
        SELECT tipo FROM votos
        WHERE product_id = ${id} AND user_id = ${userId}
        LIMIT 1
      `;
      miVoto = (mio as any)[0]?.tipo || null;
    }

    return NextResponse.json({
      up: (ups as any)[0]?.total ?? 0,
      down: (downs as any)[0]?.total ?? 0,
      miVoto,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al cargar votos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const { producto_id, tipo } = await request.json();

    if (!producto_id || !["up", "down"].includes(tipo)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const id = Number(producto_id);

    await sql`
      DELETE FROM votos
      WHERE product_id = ${id} AND user_id = ${userId}
    `;

    await sql`
      INSERT INTO votos (product_id, user_id, tipo)
      VALUES (${id}, ${userId}, ${tipo})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al votar" }, { status: 500 });
  }
}