import { sql } from "../lib/db";
import { enviarAlertaPrecio } from "../lib/email";

function parsePrecio(texto: string): number {
  return parseFloat(
    texto.replace("€", "").replace(",", ".").replace(/\s/g, "")
  );
}

export async function actualizarPrecioProducto(
  id: number,
  nuevoPrecio: string,
  precioAnterior: string,
  descuento: string
) {
  await sql`
    UPDATE productos
    SET 
      precio = ${nuevoPrecio},
      antes = ${precioAnterior},
      descuento = ${descuento},
      ultima_actualizacion = ${"Hace un momento"}
    WHERE id = ${id}
  `;

  // Alertas de precio
  const precioNum = parsePrecio(nuevoPrecio);

  const alertas = (await sql`
    SELECT * FROM alertas
    WHERE product_id = ${id}
      AND email IS NOT NULL
  `) as any[];

  const productoRows = (await sql`
    SELECT nombre FROM productos WHERE id = ${id}
  `) as any[];

  const nombreProducto = productoRows[0]?.nombre || "Producto";

  for (const alerta of alertas) {
    const objetivo = Number(alerta.precio_objetivo);
    if (precioNum <= objetivo) {
      await enviarAlertaPrecio({
        to: alerta.email,
        nombreProducto,
        precioActual: nuevoPrecio,
        precioObjetivo: String(alerta.precio_objetivo),
        productoId: id,
      });
    }
  }
}