import { sql } from "../lib/db";
import { getAmazonItem } from "./amazon";
import { ebayEstadoAnuncio } from "./ebay";

function extraerAsin(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}

function normalizarPrecioGuardado(precio: string | null): string {
  if (!precio) return "";
  return precio.replace(/\s/g, "").toLowerCase();
}

export async function comprobarProducto(
  id: number,
  url: string | null,
  tienda: string | null,
  precioGuardado: string | null
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
        return { id, estado: "no_disponible", disponible: false };
      }

      if (
        estado.precio &&
        precioGuardado &&
        normalizarPrecioGuardado(estado.precio) !==
          normalizarPrecioGuardado(precioGuardado)
      ) {
        await sql`
          UPDATE productos
          SET disponible = false,
              ultima_actualizacion = ${"Precio cambió en eBay"}
          WHERE id = ${id}
        `;
        return {
          id,
          estado: "precio_cambiado",
          disponible: false,
          precioEbay: estado.precio,
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
    SELECT id, url, tienda, precio
    FROM productos
    WHERE LOWER(tienda) IN ('amazon', 'ebay')
  `) as any[];

  const resultados = [];

  for (const p of productos) {
    const resultado = await comprobarProducto(
      p.id,
      p.url,
      p.tienda,
      p.precio
    );
    resultados.push(resultado);
  }

  return resultados;
}