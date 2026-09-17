import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

function normaliza(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/audiolibro|ebook|tapa dura|bolsillo|cd\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function parsePrecio(p: unknown) {
  return (
    parseFloat(
      String(p || "0")
        .replace("€", "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
    ) || 99999
  );
}

function noEsEspanol(nombre: string) {
  const n = normaliza(nombre);
  const catalanOFrances = [
    "el monjo",
    "les cartes",
    "les cinq",
    "les leyes",
    "vendre el",
    "va vendre",
    "es va",
    "qui empechent",
    "soi meme",
    "el jardiner",
    "i el jardiner",
    "d etre",
    "matins",
    "impulsa la",
    "aquest",
    " amb ",
    " per a ",
    " dels ",
    " duna ",
    " le pouvoir",
    " gent real",
    " histories reals",
    " em va ",
    " canviar la vida",
  ];
  return catalanOFrances.some((p) => n.includes(p));
}

function clave(nombre: string) {
  return normaliza(nombre).split(" ").slice(0, 6).join(" ");
}

export async function GET() {
  const libros = (await sql`
    SELECT id, nombre, precio
    FROM productos
    WHERE tienda = 'CasaDelLibro'
      AND (disponible = true OR disponible IS NULL)
  `) as any[];

  const idsIdioma: number[] = [];
  const espanol: any[] = [];

  for (const l of libros) {
    if (noEsEspanol(l.nombre)) idsIdioma.push(l.id);
    else espanol.push(l);
  }

  if (idsIdioma.length) {
    await sql`
      UPDATE productos
      SET disponible = false
      WHERE id = ANY(${idsIdioma})
    `;
  }

  const grupos: Record<string, any[]> = {};
  for (const l of espanol) {
    const k = clave(l.nombre);
    if (!k) continue;
    if (!grupos[k]) grupos[k] = [];
    grupos[k].push(l);
  }

  let ocultadosDupes = 0;
  const ejemplos: any[] = [];

  for (const k of Object.keys(grupos)) {
    const items = grupos[k];
    if (items.length < 2) continue;
    items.sort((a, b) => parsePrecio(a.precio) - parsePrecio(b.precio));
    const ids = items.slice(1).map((x) => x.id);
    if (ids.length) {
      await sql`
        UPDATE productos
        SET disponible = false
        WHERE id = ANY(${ids})
      `;
      ocultadosDupes += ids.length;
    }
    if (ejemplos.length < 8) {
      ejemplos.push({
        nosquedamos: items[0].nombre,
        precio: items[0].precio,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    ocultadosNoEspanol: idsIdioma.length,
    ocultadosDuplicados: ocultadosDupes,
    ejemplos,
  });
}