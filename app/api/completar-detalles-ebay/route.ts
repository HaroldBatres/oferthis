import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { fetchEbayItemDetails } from "../../services/ebay";

export async function GET() {
  const pendientes = (await sql`
    SELECT id, url
    FROM productos
    WHERE LOWER(tienda) = 'ebay'
      AND url IS NOT NULL
      AND url <> ''
      AND (
        caracteristicas IS NULL
        OR caracteristicas = ''
      )
    ORDER BY id DESC
    LIMIT 100
  `) as any[];

  let actualizados = 0;
  let saltados = 0;

  for (const p of pendientes) {
    try {
      const det = await fetchEbayItemDetails(p.url);
      const imagenesJson = JSON.stringify(det.imagenes || []);

      await sql`
        UPDATE productos
        SET
          descripcion = ${det.descripcion || ""},
          caracteristicas = ${det.caracteristicas || " "},
          imagenes = ${imagenesJson}
        WHERE id = ${p.id}
      `;
      actualizados++;
    } catch {
      await sql`
        UPDATE productos
        SET caracteristicas = ${"[sin ficha eBay]"}
        WHERE id = ${p.id}
      `;
      saltados++;
    }
  }

  return NextResponse.json({
    ok: true,
    procesados: pendientes.length,
    actualizados,
    saltados,
    quedan_mas: pendientes.length === 100,
  });
}