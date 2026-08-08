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
    const { productId, tipo } = body; // "up" o "down"

    if (!productId || !["up", "down"].includes(tipo)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await sql`
      INSERT INTO votos (user_id, product_id, tipo)
      VALUES (${userId}, ${Number(productId)}, ${tipo})
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET tipo = ${tipo}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al votar" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ up: 0, down: 0 });
    }

    const votos = await sql`
      SELECT tipo, COUNT(*) as total
      FROM votos
      WHERE product_id = ${Number(productId)}
      GROUP BY tipo
    ` as any;

    let up = 0;
    let down = 0;

    votos.forEach((v: any) => {
      if (v.tipo === "up") up = Number(v.total);
      if (v.tipo === "down") down = Number(v.total);
    });

    return NextResponse.json({ up, down });
  } catch (error) {
    return NextResponse.json({ up: 0, down: 0 });
  }
}