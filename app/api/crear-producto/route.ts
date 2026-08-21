import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

        const {
      nombre,
      tienda,
      precio,
      antes,
      descuento,
      categoria,
      imagen,
      url,
      caducaEn,
    } = body;

    if (!nombre || !tienda || !precio || !antes || !descuento || !categoria || !imagen) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO productos (
        nombre, tienda, precio, antes, descuento, categoria, imagen, url, disponible, ultima_actualizacion, caduca_en
      ) VALUES (
        ${nombre},
        ${tienda},
        ${precio},
        ${antes},
        ${descuento},
        ${categoria},
        ${imagen},
        ${url || null},
        true,
        ${"Hace un momento"},
        ${caducaEn || null}
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Producto creado correctamente",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}