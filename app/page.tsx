import { neon } from "@neondatabase/serverless";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ChollazosDelDia from "@/app/components/ChollazosDelDia";
import StoreSection from "@/app/components/StoreSection";
import NewsletterForm from "@/app/components/NewsletterForm";
import Benefits from "@/components/Benefits";

export const revalidate = 60;

const sql = neon(process.env.DATABASE_URL!);

export default async function HomePage() {
  const ordenDemanda = `
    CASE
      WHEN categoria ILIKE '%moda%' THEN 0
      WHEN categoria ILIKE '%tecnolog%' THEN 1
      WHEN categoria ILIKE '%hogar%' THEN 2
      WHEN categoria ILIKE '%deporte%' THEN 3
      ELSE 4
    END
  `;

  const [chollazos, ebay, aliexpress, amazon, libros] = await Promise.all([
    sql`
    WITH base AS (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
        AND nombre NOT ILIKE '%prueba%'
        AND (
          categoria ILIKE '%moda%'
          OR categoria ILIKE '%tecnolog%'
          OR categoria ILIKE '%hogar%'
          OR categoria ILIKE '%deporte%'
        )
        AND (
          tienda ILIKE '%amazon%'
          OR tienda ILIKE '%ebay%'
          OR tienda ILIKE '%aliexpress%'
        )
      ORDER BY nombre, descuento DESC NULLS LAST
    ),
    ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY
            CASE
              WHEN tienda ILIKE '%amazon%' THEN 'amazon'
              WHEN tienda ILIKE '%ebay%' THEN 'ebay'
              ELSE 'ali'
            END
          ORDER BY
            ${sql.unsafe(ordenDemanda)},
            descuento DESC NULLS LAST
        ) AS rn
      FROM base
    )
    SELECT *
    FROM ranked
    WHERE rn <= 4
    ORDER BY
      ${sql.unsafe(ordenDemanda)},
      descuento DESC NULLS LAST
    LIMIT 10
  `,
    sql`
    WITH base AS (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE tienda ILIKE '%ebay%'
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
        AND (
          categoria ILIKE '%moda%'
          OR categoria ILIKE '%tecnolog%'
          OR categoria ILIKE '%hogar%'
          OR categoria ILIKE '%deporte%'
        )
      ORDER BY nombre, descuento DESC NULLS LAST
    )
    SELECT *
    FROM base
    ORDER BY
      ${sql.unsafe(ordenDemanda)},
      descuento DESC NULLS LAST
    LIMIT 8
  `,
    sql`
    WITH base AS (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE tienda ILIKE '%aliexpress%'
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
        AND (
          categoria ILIKE '%moda%'
          OR categoria ILIKE '%tecnolog%'
          OR categoria ILIKE '%hogar%'
          OR categoria ILIKE '%deporte%'
        )
      ORDER BY nombre, descuento DESC NULLS LAST
    )
    SELECT *
    FROM base
    ORDER BY
      ${sql.unsafe(ordenDemanda)},
      descuento DESC NULLS LAST
    LIMIT 8
  `,
    sql`
    WITH base AS (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE tienda ILIKE '%amazon%'
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
        AND (
          categoria ILIKE '%moda%'
          OR categoria ILIKE '%tecnolog%'
          OR categoria ILIKE '%hogar%'
          OR categoria ILIKE '%deporte%'
        )
      ORDER BY nombre, descuento DESC NULLS LAST
    )
    SELECT *
    FROM base
    ORDER BY
      ${sql.unsafe(ordenDemanda)},
      descuento DESC NULLS LAST
    LIMIT 8
  `,
    sql`
    SELECT DISTINCT ON (nombre) *
    FROM productos
    WHERE (disponible = true OR disponible IS NULL)
      AND imagen IS NOT NULL
      AND tienda ILIKE '%casadellibro%'
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
    LIMIT 8
  `,
  ]);

  return (
    <main className="min-h-screen bg-[#070b16]">
      <Hero />
      <Categories />
      <ChollazosDelDia products={chollazos as any[]} />
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
        title="Ofertas de Amazon"
        href="/tienda/amazon"
        products={amazon as any[]}
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