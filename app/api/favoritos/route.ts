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
    const { productId, action } = body; // action: "add" | "remove"

    if (!productId || !action) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (action === "add") {
      await sql`
        INSERT INTO favoritos (user_id, product_id)
        VALUES (${userId}, ${Number(productId)})
        ON CONFLICT (user_id, product_id) DO NOTHING
      `;
    } else if (action === "remove") {
      await sql`
        DELETE FROM favoritos
        WHERE user_id = ${userId} AND product_id = ${Number(productId)}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error en favoritos" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ favoritos: [] });
    }

    const favoritos = await sql`
      SELECT product_id FROM favoritos WHERE user_id = ${userId}
    ` as any;

    return NextResponse.json({
      favoritos: favoritos.map((f: any) => f.product_id),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ favoritos: [] });
  }
}