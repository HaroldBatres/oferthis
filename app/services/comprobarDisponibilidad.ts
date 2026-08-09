import { sql } from "../lib/db";
import { getAmazonItem } from "./amazon";

/**
 * Extrae el ASIN de una URL de Amazon.
 * Ejemplo: https://www.amazon.es/dp/B0CHWRXH8B → B0CHWRXH8B
 */
function extraerAsin(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}

/**
 * Comprueba un producto concreto.
 * Si Amazon dice que no existe o da error de acceso, lo marca como no disponible.
 */
export async function comprobarProducto(id: number, url: string | null) {
  const asin = extraerAsin(url);

  // Si no es un enlace de Amazon con ASIN, no podemos comprobarlo aún
  if (!asin) {
    return { id, estado: "sin_asin", disponible: true };
  }

  try {
    const data = await getAmazonItem(asin);

    // Si Amazon devuelve el producto, sigue disponible
    const existe = data?.itemsResult?.items?.length > 0;

    await sql`
      UPDATE productos
      SET disponible = ${existe},
          ultima_actualizacion = ${"Comprobado automáticamente"}
      WHERE id = ${id}
    `;

    return { id, estado: existe ? "disponible" : "no_disponible", disponible: existe };
  } catch (error: any) {
    const mensaje = error?.message || "";

    // Si Amazon dice que no eres elegible, no marcamos nada todavía
    if (mensaje.includes("AssociateNotEligible")) {
      return { id, estado: "api_bloqueada", disponible: true };
    }

    // Otros errores: por ahora no lo desactivamos
    return { id, estado: "error", disponible: true, error: mensaje };
  }
}

/**
 * Comprueba todos los productos de Amazon de la base de datos.
 */
export async function comprobarTodosLosProductos() {
  const productos = (await sql`
    SELECT id, url, tienda
    FROM productos
    WHERE tienda = 'Amazon'
  `) as any[];

  const resultados = [];

  for (const p of productos) {
    const resultado = await comprobarProducto(p.id, p.url);
    resultados.push(resultado);
  }

  return resultados;
}