import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

// Listar comentarios de un producto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get("producto_id");

    if (!productoId) {
      return NextResponse.json(
        { error: "Falta producto_id" },
        { status: 400 }
      );
    }

    const comentarios = await sql`
      SELECT * FROM comentarios
      WHERE producto_id = ${Number(productoId)}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(comentarios);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al cargar comentarios" },
      { status: 500 }
    );
  }
}

// Crear comentario (solo logueados)
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
    const { producto_id, texto } = await request.json();

    if (!producto_id || !texto?.trim()) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    const userName =
      user?.firstName ||
      user?.username ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "Usuario";

    const resultado = await sql`
      INSERT INTO comentarios (producto_id, user_id, user_name, texto)
      VALUES (${Number(producto_id)}, ${userId}, ${userName}, ${texto.trim()})
      RETURNING *
    `;

    return NextResponse.json(resultado[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al guardar el comentario" },
      { status: 500 }
    );
  }
}