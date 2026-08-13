import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      nombre,
      tienda,
      precio,
      antes,
      descuento,
      categoria,
      imagen,
      url,
      etiqueta,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el id del producto" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE productos SET
        nombre = ${nombre},
        tienda = ${tienda},
        precio = ${precio},
        antes = ${antes},
        descuento = ${descuento},
        categoria = ${categoria},
        imagen = ${imagen},
        url = ${url},
        etiqueta = ${etiqueta}
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error actualizar producto:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el producto" },
      { status: 500 }
    );
  }
}