import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { searchEbayOfertas } from "../../services/ebay";

const CATEGORIAS = [
  { nombre: "Tecnología", q: "smartwatch auriculares movil" },
  { nombre: "Hogar", q: "aspiradora robot hogar" },
  { nombre: "Gaming", q: "gaming consola mando pc" },
  { nombre: "Deporte", q: "deporte running zapatillas" },
  { nombre: "Cocina", q: "freidora cafetera cocina" },
  { nombre: "Moda", q: "ropa zapatillas moda" },
  { nombre: "Belleza", q: "belleza maquillaje crema" },
  { nombre: "Mascotas", q: "mascotas perro gato" },
];

export async function GET() {
  const resumen: { categoria: string; nuevos: number }[] = [];

  try {
    for (const cat of CATEGORIAS) {
      const ofertas = await searchEbayOfertas(cat.q, 40);
      let nuevos = 0;

      for (const item of ofertas) {
        if (!item.url || !item.title) continue;

        const existe = (await sql`
          SELECT id FROM productos
          WHERE url = ${item.url}
          LIMIT 1
        `) as any[];

        if (existe.length > 0) continue;

        await sql`
          INSERT INTO productos (
            nombre, tienda, precio, antes, descuento,
            categoria, imagen, url, disponible
          )
          VALUES (
            ${item.title},
            ${"eBay"},
            ${item.precio},
            ${item.antes || item.precio},
            ${item.descuento || ""},
            ${cat.nombre},
            ${item.imagen || "https://picsum.photos/400/400"},
            ${item.url},
            ${true}
          )
        `;
        nuevos++;
      }

      resumen.push({ categoria: cat.nombre, nuevos });
    }

    return NextResponse.json({ ok: true, resumen });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}