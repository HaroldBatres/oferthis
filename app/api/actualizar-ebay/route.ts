import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { fetchEbayItemDetails } from "../../services/ebay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = Number(body.productId);

    if (!productId) {
      return NextResponse.json({ error: "Falta productId" }, { status: 400 });
    }

    const rows = (await sql`
      SELECT id, url, tienda FROM productos WHERE id = ${productId}
    `) as any[];

    const producto = rows[0];
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const tienda = String(producto.tienda || "").toLowerCase();
    if (!producto.url || !tienda.includes("ebay")) {
      return NextResponse.json(
        { error: "Este producto no tiene URL de eBay" },
        { status: 400 }
      );
    }

    const details = await fetchEbayItemDetails(producto.url);

    await sql`
      UPDATE productos SET
        descripcion = ${details.descripcion || null},
        caracteristicas = ${details.caracteristicas || null}
      WHERE id = ${productId}
    `;

    return NextResponse.json({
      ok: true,
      productId,
      title: details.title,
      caracteristicasLength: details.caracteristicas?.length ?? 0,
      descripcionLength: details.descripcion?.length ?? 0,
    });
  } catch (error: any) {
    console.error("[actualizar-ebay]", error);
    return NextResponse.json(
      { error: error?.message || "Error al actualizar desde eBay" },
      { status: 500 }
    );
  }
}