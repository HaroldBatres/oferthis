import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import {
  extractEbayItemId,
  fetchEbayItemDetails,
} from "../../services/ebay";

export async function POST() {
  try {
    const productos = (await sql`
      SELECT id, url, tienda FROM productos
      WHERE url IS NOT NULL
        AND (
          LOWER(tienda) LIKE '%ebay%'
          OR url ILIKE '%ebay.%'
        )
      ORDER BY id
    `) as any[];

    const results: { id: number; ok: boolean; error?: string }[] = [];

    for (const p of productos) {
      try {
        const itemId = extractEbayItemId(String(p.url));
        if (!itemId) {
          results.push({ id: p.id, ok: false, error: "Sin ID eBay" });
          continue;
        }

        const details = await fetchEbayItemDetails(itemId);

        await sql`
          UPDATE productos SET
            descripcion = ${details.descripcion || null},
            caracteristicas = ${details.caracteristicas || null},
            nombre = COALESCE(NULLIF(${details.title}, ''), nombre)
          WHERE id = ${p.id}
        `;

        results.push({ id: p.id, ok: true });

        // Evitar saturar la API de eBay
        await new Promise((r) => setTimeout(r, 400));
      } catch (e: any) {
        results.push({
          id: p.id,
          ok: false,
          error: e?.message || "Error",
        });
      }
    }

    return NextResponse.json({
      total: productos.length,
      ok: results.filter((r) => r.ok).length,
      fail: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error general" },
      { status: 500 }
    );
  }
}