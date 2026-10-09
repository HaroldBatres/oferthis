import { neon } from "@neondatabase/serverless";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ChollazosDelDia from "@/app/components/ChollazosDelDia";
import StoreSection from "@/app/components/StoreSection";
import NewsletterForm from "@/app/components/NewsletterForm";
import Benefits from "@/components/Benefits";

export const revalidate = 60;

const sql = neon(process.env.DATABASE_URL!);

const ChollazosAny = ChollazosDelDia as any;

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
    11: `nombre ILIKE '%portatil%' OR nombre ILIKE '%movil%' OR nombre ILIKE '%smartphone%' OR nombre ILIKE '%tablet%' OR nombre ILIKE '%tv %' OR nombre ILIKE '%television%' OR nombre ILIKE '%playstation%' OR nombre ILIKE '%xbox%' OR nombre ILIKE '%consola%'`,
    12: `nombre ILIKE '%navidad%' OR nombre ILIKE '%regalo%' OR nombre ILIKE '%arbol%' OR nombre ILIKE '%smartwatch%' OR nombre ILIKE '%auricular%'`,
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

export default async function HomePage() {
  const mes = mesMadrid();
  const temp = sqlTemporada(mes);
  const bucket = `
    CASE
      WHEN ${temp} THEN 'temp'
      WHEN ${SQL_MODA} THEN 'moda'
      ELSE 'resto'
    END
  `;

  const cincoTienda = (tiendaLike: string) => sql`
    WITH base AS (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE tienda ILIKE ${tiendaLike}
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
        AND nombre NOT ILIKE '%prueba%'
      ORDER BY nombre, descuento DESC NULLS LAST
    ),
    tagged AS (
      SELECT *, ${sql.unsafe(bucket)} AS bucket FROM base
    ),
    ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY bucket
          ORDER BY descuento DESC NULLS LAST
        ) AS rn
      FROM tagged
    )
    SELECT *
    FROM ranked
    WHERE
      (bucket = 'temp' AND rn <= 2)
      OR (bucket = 'moda' AND rn <= 2)
      OR (bucket = 'resto' AND rn <= 1)
    ORDER BY
      CASE bucket WHEN 'temp' THEN 0 WHEN 'moda' THEN 1 ELSE 2 END,
      descuento DESC NULLS LAST
    LIMIT 5
  `;

  const diezTienda = (tiendaLike: string) => sql`
    WITH base AS (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE tienda ILIKE ${tiendaLike}
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
        AND nombre NOT ILIKE '%prueba%'
      ORDER BY nombre, descuento DESC NULLS LAST
    ),
    tagged AS (
      SELECT *, ${sql.unsafe(bucket)} AS bucket FROM base
    ),
    ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY bucket
          ORDER BY descuento DESC NULLS LAST
        ) AS rn
      FROM tagged
    )
    SELECT *
    FROM ranked
    WHERE
      (bucket = 'temp' AND rn <= 4)
      OR (bucket = 'moda' AND rn <= 4)
      OR (bucket = 'resto' AND rn <= 2)
    ORDER BY
      CASE bucket WHEN 'temp' THEN 0 WHEN 'moda' THEN 1 ELSE 2 END,
      descuento DESC NULLS LAST
    LIMIT 10
  `;

  const [
    ebay5,
    ali5,
    amazon5,
    joma,
    nikeBlanca,
    libros5,
    ebay,
    aliexpress,
    amazon,
    libros,
  ] = await Promise.all([
    cincoTienda("%ebay%"),
    cincoTienda("%aliexpress%"),
    cincoTienda("%amazon%"),
    sql`
      SELECT *
      FROM productos
      WHERE tienda ILIKE '%amazon%'
        AND nombre ILIKE '%joma%'
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
      ORDER BY id DESC
      LIMIT 1
    `,
    sql`
      SELECT *
      FROM productos
      WHERE tienda ILIKE '%amazon%'
        AND nombre ILIKE '%nike%'
        AND nombre ILIKE '%blanca%'
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
      ORDER BY id DESC
      LIMIT 1
    `,
    sql`
      SELECT *
      FROM productos
      WHERE (disponible = true OR disponible IS NULL)
        AND imagen IS NOT NULL
        AND imagen <> ''
        AND (
          tienda ILIKE '%casadellibro%'
          OR tienda ILIKE '%casa del libro%'
          OR tienda ILIKE '%casa%libro%'
        )
      ORDER BY
        CASE
          WHEN autor ILIKE '%Proctor%'
            OR autor ILIKE '%Tracy%'
            OR autor ILIKE '%Robbins%'
            OR autor ILIKE '%Rohn%'
            OR autor ILIKE '%Burchard%'
            OR autor ILIKE '%Hill%'
            OR autor ILIKE '%Sharma%'
            OR autor ILIKE '%Ferriss%'
            OR autor ILIKE '%Kiyosaki%'
            OR autor ILIKE '%Hicks%'
            OR autor ILIKE '%Byrne%'
            OR autor ILIKE '%Canfield%'
            OR autor ILIKE '%Bourbeau%'
            OR autor ILIKE '%Orihuela%'
            OR autor ILIKE '%Bradshaw%'
            OR nombre ILIKE '%Kiyosaki%'
            OR nombre ILIKE '%Napoleon Hill%'
            OR nombre ILIKE '%Robin Sharma%'
            OR nombre ILIKE '%Tony Robbins%'
            OR nombre ILIKE '%Brian Tracy%'
            OR nombre ILIKE '%padre rico%'
            OR nombre ILIKE '%monje que vendio%'
            OR nombre ILIKE '%el secreto%'
          THEN 0
          ELSE 1
        END ASC,
        id DESC
      LIMIT 5
    `,
    diezTienda("%ebay%"),
    diezTienda("%aliexpress%"),
    sql`
      SELECT *
      FROM productos
      WHERE tienda ILIKE '%amazon%'
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
        AND nombre NOT ILIKE '%prueba%'
      ORDER BY descuento DESC NULLS LAST, id DESC
      LIMIT 10
    `,
    sql`
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE (disponible = true OR disponible IS NULL)
        AND imagen IS NOT NULL
        AND (
          tienda ILIKE '%casadellibro%'
          OR tienda ILIKE '%casa del libro%'
        )
        AND (
          autor ILIKE '%Proctor%'
          OR autor ILIKE '%Tracy%'
          OR autor ILIKE '%Robbins%'
          OR autor ILIKE '%Rohn%'
          OR autor ILIKE '%Burchard%'
          OR autor ILIKE '%Hill%'
          OR autor ILIKE '%Sharma%'
          OR autor ILIKE '%Ferriss%'
          OR autor ILIKE '%Kiyosaki%'
          OR autor ILIKE '%Hicks%'
          OR autor ILIKE '%Byrne%'
          OR autor ILIKE '%Canfield%'
          OR autor ILIKE '%Bourbeau%'
          OR autor ILIKE '%Orihuela%'
          OR autor ILIKE '%Bradshaw%'
          OR nombre ILIKE '%Kiyosaki%'
          OR nombre ILIKE '%Napoleon Hill%'
          OR nombre ILIKE '%Robin Sharma%'
          OR nombre ILIKE '%Tony Robbins%'
          OR nombre ILIKE '%Brian Tracy%'
          OR nombre ILIKE '%padre rico%'
          OR nombre ILIKE '%monje que vendio%'
          OR nombre ILIKE '%el secreto%'
        )
      ORDER BY nombre, id DESC
      LIMIT 10
    `,
  ]);

  const fijados = [...(joma as any[]), ...(nikeBlanca as any[])];
  const idsFijados = new Set(fijados.map((p) => p.id));

  const amazonChollos = [
    ...fijados,
    ...(amazon5 as any[]).filter((p) => !idsFijados.has(p.id)),
  ].slice(0, 5);

  const chollazos = [
    ...amazonChollos,
    ...(ebay5 as any[]).slice(0, 5),
    ...(ali5 as any[]).slice(0, 5),
    ...(libros5 as any[]).slice(0, 5),
  ];

  return (
    <main className="min-h-screen bg-[#070b16]">
      <Hero />
      <Categories />
      <ChollazosAny products={chollazos} />
      <StoreSection
        title="Ofertas de Amazon"
        href="/tienda/amazon"
        products={amazon as any[]}
      />
      <StoreSection
        title="Ofertas de eBay"
        href="/tienda/ebay"
        products={ebay as any[]}
      />
      <StoreSection
        title="Ofertas de AliExpress"
        href="/tienda/aliexpress"
        products={aliexpress as any[]}
      />
      <StoreSection
        title="Ofertas de Casa del Libro"
        href="/buscar?q=libros"
        products={libros as any[]}
      />
      <Benefits />
      <NewsletterForm />
    </main>
  );
}