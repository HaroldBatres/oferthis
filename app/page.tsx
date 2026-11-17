import { neon } from "@neondatabase/serverless";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ChollazosDelDia from "@/app/components/ChollazosDelDia";
import StoreSection from "@/app/components/StoreSection";
import NewsletterForm from "@/app/components/NewsletterForm";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";

export const metadata = {
  alternates: { canonical: "https://www.oferthis.com" },
  openGraph: {
    title: "Oferthis - Las mejores ofertas",
    description:
      "Ofertas reales de Amazon, eBay, AliExpress y más tiendas actualizadas automáticamente.",
    url: "https://www.oferthis.com",
    siteName: "Oferthis",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1254,
        height: 1254,
        alt: "Oferthis",
      },
    ],
  },
};

export const revalidate = 60;

const sql = neon(process.env.DATABASE_URL!);

const ChollazosAny = ChollazosDelDia as any;

// Descuento numérico seguro: "-35%" -> 35, "0%" / "-0%" / "" / NULL / basura -> 0.
// Ordenar el texto tal cual ponía "0%" por delante de "-50%".
const SQL_DESC_NUM = `COALESCE(LEFT(SUBSTRING(descuento FROM '[0-9]+'), 3)::INTEGER, 0)`;

// Libros más vendidos ahora mismo (Casa del Libro / listas de ventas en España, noviembre 2026).
// Solo cambia lo que enseña la portada; el resto del catálogo sigue disponible en la búsqueda.
const LIBROS_MAS_VENDIDOS = [
  "La hora antes del alba",
  "Cosamala",
  "La hipótesis más peligrosa",
  "Una corte de armonía rota",
  "Una familia moderna",
  "Un hombre de honor",
  "La añoranza",
  "Contenta",
  "Conversación con la oscuridad",
  "Un día en la vida de Clarita",
  "Hábitos atómicos",
  "La psicología del dinero",
  "Sin respeto",
  "El día de la Trilla (Empíreo)",
  "Verity. La sombra de un engaño",
  "El hombre en busca de sentido",
];

function mesMadrid() {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      month: "numeric",
    }).format(new Date())
  );
}

function sqlTemporada(mes: number) {
  const mapa: Record<number, string> = {
    1: `nombre ILIKE '%rebaja%' OR nombre ILIKE '%abrigo%' OR nombre ILIKE '%calefaccion%' OR nombre ILIKE '%sudadera%'`,
    2: `nombre ILIKE '%san valentin%' OR nombre ILIKE '%regalo%' OR nombre ILIKE '%belleza%' OR nombre ILIKE '%perfume%'`,
    3: `nombre ILIKE '%primavera%' OR nombre ILIKE '%limpieza%' OR nombre ILIKE '%organizador%'`,
    4: `nombre ILIKE '%jardin%' OR nombre ILIKE '%bici%' OR nombre ILIKE '%deporte%'`,
    5: `nombre ILIKE '%madre%' OR nombre ILIKE '%belleza%' OR nombre ILIKE '%secador%'`,
    6: `nombre ILIKE '%verano%' OR nombre ILIKE '%playa%' OR nombre ILIKE '%ventilador%' OR nombre ILIKE '%gafas%'`,
    7: `nombre ILIKE '%verano%' OR nombre ILIKE '%playa%' OR nombre ILIKE '%piscina%' OR nombre ILIKE '%viaje%'`,
    8: `nombre ILIKE '%verano%' OR nombre ILIKE '%mochila%' OR nombre ILIKE '%escolar%'`,
    9: `nombre ILIKE '%sudadera%' OR nombre ILIKE '%hoodie%' OR nombre ILIKE '%zapato%' OR nombre ILIKE '%zapatilla%' OR nombre ILIKE '%bota%' OR nombre ILIKE '%abrigo%' OR nombre ILIKE '%chaqueta%'`,
    10: `nombre ILIKE '%halloween%' OR nombre ILIKE '%disfraz%' OR nombre ILIKE '%calabaza%' OR nombre ILIKE '%pumpkin%' OR nombre ILIKE '%fantasma%'`,
    11: `nombre ~* '(black friday|navidad|navideñ|regalo|lego|juguete|invierno|abrigo|plum[ií]fero|chaqueta|parka|manta|calefact|t[eé]rmic|bufanda|guantes|gorro|botas?( |$)|port[aá]til|m[oó]vil|smartphone|tablet|smart ?tv|televis|qled|oled|consola|playstation|ps5|xbox|nintendo|switch 2|mando|auricular|smartwatch|reloj inteligente|freidora|aspirador|luces)'`,
    12: `nombre ~* '(navidad|navideñ|regalo|reyes|invierno|abrigo|plum[ií]fero|manta|calefact|t[eé]rmic|bufanda|guantes|gorro|juguete|lego|perfume|consola|playstation|ps5|xbox|nintendo|switch 2|mando|auricular|smartwatch|reloj inteligente|tablet|port[aá]til|m[oó]vil|smartphone|smart ?tv|luces|[aá]rbol)'`,
  };
  return mapa[mes] || mapa[9];
}

const SQL_MODA = `
  categoria ILIKE '%moda%'
  OR nombre ILIKE '%sudadera%'
  OR nombre ILIKE '%hoodie%'
  OR nombre ILIKE '%camisa%'
  OR nombre ILIKE '%camiseta%'
  OR nombre ILIKE '%pantalon%'
  OR nombre ILIKE '%vestido%'
  OR nombre ILIKE '%chaqueta%'
  OR nombre ILIKE '%zapato%'
  OR nombre ILIKE '%zapatilla%'
  OR nombre ILIKE '%bota%'
  OR nombre ILIKE '%jersey%'
  OR nombre ILIKE '%abrigo%'
`;

// Halloween solo se muestra en octubre (hora de Madrid). El resto del año
// se ocultan los productos de Halloween de la portada (siguen en la base de datos).
function sqlFiltroHalloween(mes: number) {
  return mes === 10 ? "AND TRUE" : "AND nombre NOT ILIKE '%halloween%'";
}

function claveNombre(p: any) {
  return String(p?.nombre ?? "").trim().toLowerCase();
}

// Quita de una fila los productos que ya salen en "Lo mejor de Oferthis hoy"
// (o en filas anteriores) para no repetirlos en la misma portada.
function sinRepetidos(lista: any[], vistos: Set<string>, max: number) {
  const out: any[] = [];
  for (const p of lista) {
    const kId = `id:${p?.id}`;
    const kNombre = `n:${claveNombre(p)}`;
    if (vistos.has(kId) || (claveNombre(p) && vistos.has(kNombre))) continue;
    out.push(p);
    if (out.length >= max) break;
  }
  for (const p of out) {
    vistos.add(`id:${p?.id}`);
    if (claveNombre(p)) vistos.add(`n:${claveNombre(p)}`);
  }
  return out;
}

export default async function HomePage() {
  const mes = mesMadrid();
  const temp = sqlTemporada(mes);
  const filtroHalloween = sqlFiltroHalloween(mes);
  const bucket = `
    CASE
      WHEN ${temp} THEN 'temp'
      WHEN ${SQL_MODA} THEN 'moda'
      ELSE 'resto'
    END
  `;

  // Solo chollos reales: con imagen, visibles, sin pruebas, precio > 0 y descuento numérico > 0.
  // Un producto por nombre (el de mayor descuento). Temporada primero, luego moda, luego el resto.
  const filaTienda = (tiendaLike: string, cupos: [number, number, number], limite: number) => sql`
    WITH base AS (
      SELECT DISTINCT ON (lower(trim(nombre))) *
      FROM productos
      WHERE tienda ILIKE ${tiendaLike}
        AND imagen IS NOT NULL
        AND imagen <> ''
        ${sql.unsafe(filtroHalloween)}
        AND (disponible = true OR disponible IS NULL)
        AND nombre NOT ILIKE '%prueba%'
        AND ${sql.unsafe(SQL_DESC_NUM)} > 0
        AND ${sql.unsafe(SQL_DESC_NUM)} < 90
      ORDER BY lower(trim(nombre)), ${sql.unsafe(SQL_DESC_NUM)} DESC, id DESC
    ),
    tagged AS (
      SELECT *, ${sql.unsafe(bucket)} AS bucket FROM base
    ),
    ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY bucket
          ORDER BY ${sql.unsafe(SQL_DESC_NUM)} DESC, id DESC
        ) AS rn
      FROM tagged
    )
    SELECT *
    FROM ranked
    WHERE
      (bucket = 'temp' AND rn <= ${cupos[0]})
      OR (bucket = 'moda' AND rn <= ${cupos[1]})
      OR (bucket = 'resto' AND rn <= ${cupos[2]})
    ORDER BY
      CASE bucket WHEN 'temp' THEN 0 WHEN 'moda' THEN 1 ELSE 2 END,
      ${sql.unsafe(SQL_DESC_NUM)} DESC,
      id DESC
    LIMIT ${limite}
  `;

  const [amazon, aliexpress, ebay, mibro, libros] = await Promise.all([
    // Amazon: escaparate de temporada (Black Friday / invierno / Navidad), todo lo que tenga descuento real.
    filaTienda("%amazon%", [15, 15, 15], 15),
    filaTienda("%aliexpress%", [12, 8, 5], 25),
    filaTienda("%ebay%", [12, 8, 5], 25),
    sql`
      SELECT DISTINCT ON (${sql.unsafe(SQL_DESC_NUM)}, lower(trim(nombre))) *
      FROM productos
      WHERE tienda = 'Mibro'
        AND imagen IS NOT NULL
        AND imagen <> ''
        AND (disponible = true OR disponible IS NULL)
        AND ${sql.unsafe(SQL_DESC_NUM)} > 0
      ORDER BY ${sql.unsafe(SQL_DESC_NUM)} DESC, lower(trim(nombre)), id DESC
      LIMIT 25
    `,
    sql`
      SELECT *
      FROM (
        SELECT DISTINCT ON (nombre) *
        FROM productos
        WHERE (disponible = true OR disponible IS NULL)
          AND imagen IS NOT NULL
          AND imagen <> ''
          AND tienda = 'CasaDelLibro'
          AND (
            nombre = ANY(${LIBROS_MAS_VENDIDOS}::text[])
            OR ${sql.unsafe(SQL_DESC_NUM)} > 0
          )
        ORDER BY nombre, id DESC
      ) l
      ORDER BY
        ${sql.unsafe(SQL_DESC_NUM)} DESC,
        COALESCE(array_position(${LIBROS_MAS_VENDIDOS}::text[], nombre), 999),
        id DESC
      LIMIT 25
    `,
  ]);

  // Orden fijo de la portada: Amazon (temporada) arriba y destacado, luego
  // "Lo mejor de Oferthis hoy" con lo mejor del resto de tiendas, y una fila por marketplace.
  const vistos = new Set<string>();
  const amazonFila = sinRepetidos(amazon as any[], vistos, 15);

  const chollazos: any[] = [];
  for (const lista of [aliexpress, ebay, mibro, libros] as any[][]) {
    chollazos.push(...sinRepetidos(lista, vistos, 5));
  }

  const aliexpressFila = sinRepetidos(aliexpress as any[], vistos, 10);
  const ebayFila = sinRepetidos(ebay as any[], vistos, 10);
  const mibroFila = sinRepetidos(mibro as any[], vistos, 10);
  const librosFila = sinRepetidos(libros as any[], vistos, 10);

  const tituloAmazon =
    mes === 11 ? "Black Friday en Amazon" : mes === 12 ? "Regalos de Navidad en Amazon" : "Ofertas de Amazon";

  return (
    <main className="min-h-screen bg-[#070b16]">
      <Hero />
      <Categories mostrarHalloween={mes === 10} mes={mes} />
      <StoreSection
        title={tituloAmazon}
        href="/tienda/amazon"
        products={amazonFila}
      />
      <ChollazosAny products={chollazos} />
      <StoreSection
        title="Ofertas de AliExpress"
        href="/tienda/aliexpress"
        products={aliexpressFila}
      />
      <StoreSection
        title="Ofertas de eBay"
        href="/tienda/ebay"
        products={ebayFila}
      />
      <StoreSection
        title="Ofertas de Mibro"
        href="/tienda/mibro"
        products={mibroFila}
      />
      <StoreSection
        title="Libros más vendidos en Casa del Libro"
        href="/tienda/casadellibro"
        products={librosFila}
      />
      <Benefits />
      <NewsletterForm />
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}
