import { sql } from "../lib/db";

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
}