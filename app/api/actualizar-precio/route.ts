import { NextRequest, NextResponse } from "next/server";
import { actualizarPrecioProducto } from "../../services/priceUpdater";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { id, nuevoPrecio, precioAnterior, descuento } = body;

    if (!id || !nuevoPrecio || !precioAnterior || !descuento) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    await actualizarPrecioProducto(
      Number(id),
      nuevoPrecio,
      precioAnterior,
      descuento
    );

    return NextResponse.json({
      success: true,
      message: "Precio actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar el precio" },
      { status: 500 }
    );
  }
}