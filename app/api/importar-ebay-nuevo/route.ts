import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { searchEbayOfertas } from "../../services/ebay";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "freidora";
  const categoria =
    request.nextUrl.searchParams.get("categoria") || "Cocina";

  try {
    const ofertas = await searchEbayOfertas(q, 8);

    for (const oferta of ofertas) {
      if (!oferta.url) continue;

      const existentes = (await sql`
        SELECT id FROM productos
        WHERE url = ${oferta.url}
        LIMIT 1
      `) as any[];

      if (existentes.length > 0) continue;

      const precio = oferta.precio || "0,00€";
      const antes = oferta.antes || precio;
      const descuento = oferta.descuento || "-10%";

      const insertados = (await sql`
        INSERT INTO productos (
          nombre,
          tienda,
          precio,
          antes,
          descuento,
          categoria,
          imagen,
          url,
          disponible,
          ultima_actualizacion
        )
        VALUES (
          ${oferta.title},
          ${"eBay"},
          ${precio},
          ${antes},
          ${descuento},
          ${categoria},
          ${oferta.imagen},
          ${oferta.url},
          ${true},
          ${"Importado automáticamente eBay"}
        )
        RETURNING id, nombre, precio
      `) as any[];

      return NextResponse.json({
        ok: true,
        insertado: insertados[0],
        categoria,
      });
    }

    return NextResponse.json({
      ok: true,
      insertado: null,
      message: "Todos esos anuncios ya estaban en Oferthis",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Error al importar" },
      { status: 500 }
    );
  }
}