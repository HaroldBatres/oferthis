import { sql } from "../lib/db";
import { getAmazonItem } from "./amazon";
import { ebayAnuncioExiste } from "./ebay";

function extraerAsin(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}

export async function comprobarProducto(
  id: number,
  url: string | null,
  tienda: string | null
) {
  const tiendaNorm = (tienda || "").toLowerCase();

  if (tiendaNorm === "ebay") {
    if (!url) {
      return { id, estado: "sin_url", disponible: true };
    }

    try {
      const existe = await ebayAnuncioExiste(url);

      await sql`
        UPDATE productos
        SET disponible = ${existe},
            ultima_actualizacion = ${"Comprobado automáticamente eBay"}
        WHERE id = ${id}
      `;

      return {
        id,
        estado: existe ? "disponible" : "no_disponible",
        disponible: existe,
      };
    } catch (error: any) {
      return {
        id,
        estado: "error",
        disponible: true,
        error: error?.message || "Error eBay",
      };
    }
  }

  if (tiendaNorm === "amazon") {
    const asin = extraerAsin(url);

    if (!asin) {
      return { id, estado: "sin_asin", disponible: true };
    }

    try {
      const data = await getAmazonItem(asin);
      const existe = data?.itemsResult?.items?.length > 0;

      await sql`
        UPDATE productos
        SET disponible = ${existe},
            ultima_actualizacion = ${"Comprobado automáticamente Amazon"}
        WHERE id = ${id}
      `;

      return {
        id,
        estado: existe ? "disponible" : "no_disponible",
        disponible: existe,
      };
    } catch (error: any) {
      const mensaje = error?.message || "";

      if (mensaje.includes("AssociateNotEligible")) {
        return { id, estado: "api_bloqueada", disponible: true };
      }

      return { id, estado: "error", disponible: true, error: mensaje };
    }
  }

  return { id, estado: "tienda_no_soportada", disponible: true };
}

export async function comprobarTodosLosProductos() {
  const productos = (await sql`
    SELECT id, url, tienda
    FROM productos
    WHERE LOWER(tienda) IN ('amazon', 'ebay')
  `) as any[];

  const resultados = [];

  for (const p of productos) {
    const resultado = await comprobarProducto(p.id, p.url, p.tienda);
    resultados.push(resultado);
  }

  return resultados;
}