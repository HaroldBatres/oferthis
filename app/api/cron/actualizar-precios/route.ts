import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../lib/db";

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
        // Por ahora registramos la revisión.
        // Cuando la API de Amazon (u otra) devuelva precio real,
        // aquí se llamará a actualizarPrecioProducto.
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

// cron v2 - forzar deploy