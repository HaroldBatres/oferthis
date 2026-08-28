import { sql } from "../lib/db";
import { getAmazonItem } from "./amazon";
import { ebayEstadoAnuncio, searchEbayOfertas } from "./ebay";

function extraerAsin(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}

async function importarReemplazoEbay(categoria: string | null) {
  const q = categoria && categoria.trim() ? categoria : "oferta";

  try {
    const ofertas = await searchEbayOfertas(q, 8);

    for (const oferta of ofertas) {
      if (!oferta.url) continue;

      const existentes = (await sql`
        SELECT id FROM productos WHERE url = ${oferta.url} LIMIT 1
      `) as any[];
      if (existentes.length > 0) continue;

      const precio = oferta.precio || "0,00€";
      const antes = oferta.antes || precio;
      const descuento = oferta.descuento || "-10%";

      const insertados = (await sql`
        INSERT INTO productos (
          nombre, tienda, precio, antes, descuento, categoria,
          imagen, url, disponible, ultima_actualizacion
        )
        VALUES (
          ${oferta.title},
          ${"eBay"},
          ${precio},
          ${antes},
          ${descuento},
          ${categoria || "General"},
          ${oferta.imagen},
          ${oferta.url},
          ${true},
          ${"Reemplazo automático eBay"}
        )
        RETURNING id, nombre
      `) as any[];

      return insertados[0] || null;
    }
  } catch {
    return null;
  }

  return null;
}

export async function comprobarProducto(
  id: number,
  url: string | null,
  tienda: string | null,
  precioGuardado: string | null,
  categoria?: string | null
) {
  const tiendaNorm = (tienda || "").toLowerCase();

  if (tiendaNorm === "ebay") {
    if (!url) {
      return { id, estado: "sin_url", disponible: true };
    }

    try {
      const estado = await ebayEstadoAnuncio(url);

      if (!estado.existe) {
        await sql`
          UPDATE productos
          SET disponible = false,
              ultima_actualizacion = ${"Caducado en eBay"}
          WHERE id = ${id}
        `;

        const nuevo = await importarReemplazoEbay(categoria || null);

        return {
          id,
          estado: "no_disponible",
          disponible: false,
          reemplazo: nuevo,
        };
      }

      await sql`
        UPDATE productos
        SET disponible = true,
            ultima_actualizacion = ${"Comprobado automáticamente eBay"}
        WHERE id = ${id}
      `;

      return { id, estado: "disponible", disponible: true };
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
    SELECT id, url, tienda, precio, categoria
    FROM productos
    WHERE LOWER(tienda) IN ('amazon', 'ebay')
      AND (disponible = true OR disponible IS NULL)
  `) as any[];

  const resultados = [];

  for (const p of productos) {
    const resultado = await comprobarProducto(
      p.id,
      p.url,
      p.tienda,
      p.precio,
      p.categoria
    );
    resultados.push(resultado);
  }

  return resultados;
}