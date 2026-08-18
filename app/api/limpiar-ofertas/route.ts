import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

/**
 * Marca como no disponibles:
 * - productos sin URL
 * - URL genérica (home de tienda, no el anuncio)
 * - eBay sin /itm/ en la URL
 * - imágenes de prueba (picsum)
 */
export async function POST() {
  try {
    const result = await sql`
      UPDATE productos
      SET disponible = false
      WHERE disponible = true OR disponible IS NULL
        AND (
          url IS NULL
          OR url = ''
          OR url IN (
            'https://www.ebay.es',
            'https://ebay.es',
            'https://amazon.es',
            'https://www.amazon.es',
            'https://es.aliexpress.com',
            'https://aliexpress.com',
            'https://es.shein.com',
            'https://www.shein.com'
          )
          OR (
            LOWER(tienda) = 'ebay'
            AND url NOT ILIKE '%/itm/%'
          )
          OR imagen ILIKE '%picsum%'
        )
      RETURNING id, nombre
    `;

    return NextResponse.json({
      ok: true,
      marcados: result.length,
      productos: result,
    });
  } catch (error: any) {
    console.error("limpiar-ofertas:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Error al limpiar" },
      { status: 500 }
    );
  }
}