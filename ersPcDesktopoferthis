import { NextRequest, NextResponse } from "next/server";
import { actualizarPrecioProducto } from "../../services/priceUpdater";
import { sql } from "../../lib/db";

// Actualización manual (botón)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nuevoPrecio, precioAnterior, descuento } = body;

    if (!id || !nuevoPrecio || !precioAnterior || !descuento) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
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

// Cron automático (cada X horas)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productos = (await sql`
      SELECT id, nombre, precio, antes, descuento, url, tienda
      FROM productos
      WHERE (disponible = true OR disponible IS NULL)
      ORDER BY id
      LIMIT 50
    `) as any[];

    let revisados = 0;
    let actualizados = 0;
    const errores: string[] = [];

    for (const p of productos) {
      revisados++;
      try {
        await sql`
          UPDATE productos
          SET ultima_actualizacion = ${"Revisado automáticamente"}
          WHERE id = ${p.id}
        `;
        actualizados++;
      } catch (e: any) {
        errores.push(`id ${p.id}: ${e?.message || "error"}`);
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: "Cron de precios ejecutado",
      revisados,
      actualizados,
      errores: errores.slice(0, 10),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error en el cron de precios" },
      { status: 500 }
    );
  }
}