import { neon } from "@neondatabase/serverless";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ChollazosDelDia from "@/app/components/ChollazosDelDia";
import StoreSection from "@/app/components/StoreSection";
import NewsletterForm from "@/app/components/NewsletterForm";
import Benefits from "@/components/Benefits";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

export default async function HomePage() {
      const chollazos = await sql`
    WITH base AS (
      SELECT *
      FROM productos
      WHERE imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
        AND nombre NOT ILIKE '%prueba%'
    ),
    amazon_destacados AS (
      SELECT *
      FROM base
      WHERE tienda ILIKE '%amazon%'
      ORDER BY descuento DESC NULLS LAST
      LIMIT 3
    ),
        resto AS (
      SELECT * FROM base WHERE tienda NOT ILIKE '%amazon%'
    ),
    ranked_resto AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY tienda, categoria ORDER BY descuento DESC NULLS LAST) AS rank_tienda_categoria
      FROM resto
    ),
    top_resto AS (
      SELECT * FROM ranked_resto WHERE rank_tienda_categoria = 1
    ),
    limitado_tienda AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY tienda ORDER BY descuento DESC NULLS LAST) AS rank_tienda
      FROM top_resto
    ),
    combinado AS (
      SELECT id, nombre, tienda, precio, antes, descuento, categoria, imagen, url, valoracion, opiniones, entrega, etiqueta, disponible, ultima_actualizacion, historial_precios
      FROM amazon_destacados
      UNION ALL
      SELECT id, nombre, tienda, precio, antes, descuento, categoria, imagen, url, valoracion, opiniones, entrega, etiqueta, disponible, ultima_actualizacion, historial_precios
      FROM limitado_tienda WHERE rank_tienda <= 4
    )
    SELECT *
    FROM combinado
    ORDER BY descuento DESC NULLS LAST
    LIMIT 10
  `;

     const ordenCategoria = `
    CASE categoria
      WHEN 'Moda' THEN 1
      WHEN 'Tecnologia' THEN 2
      WHEN 'Hogar' THEN 3
      WHEN 'Cocina' THEN 4
      WHEN 'Belleza' THEN 5
      WHEN 'Deporte' THEN 6
      WHEN 'Automocion' THEN 7
      WHEN 'Herramientas' THEN 8
            WHEN 'Mascotas' THEN 9
      WHEN 'Gaming' THEN 10
      WHEN 'Libros' THEN 11
      ELSE 12
    END
  `;

  const ebay = await sql`
    WITH base AS (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE tienda ILIKE '%ebay%'
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
      ORDER BY nombre, descuento DESC NULLS LAST
    ),
    ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY descuento DESC NULLS LAST) AS rank_categoria,
        ${sql.unsafe(ordenCategoria)} AS orden_demanda
      FROM base
    )
    SELECT *
    FROM ranked
    WHERE rank_categoria = 1
    ORDER BY orden_demanda
    LIMIT 8
  `;

  const aliexpress = await sql`
    WITH base AS (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE tienda ILIKE '%aliexpress%'
        AND imagen IS NOT NULL
        AND (disponible = true OR disponible IS NULL)
      ORDER BY nombre, descuento DESC NULLS LAST
    ),
    ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY descuento DESC NULLS LAST) AS rank_categoria,
        ${sql.unsafe(ordenCategoria)} AS orden_demanda
      FROM base
    )
    SELECT *
    FROM ranked
    WHERE rank_categoria = 1
    ORDER BY orden_demanda
    LIMIT 8
  `;  

  const amazon = await sql`
    SELECT DISTINCT ON (nombre) *
    FROM productos
    WHERE tienda ILIKE '%amazon%'
    ORDER BY nombre
    LIMIT 8
  `;

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
        <Benefits />
      <NewsletterForm />
    </main>
  );
}