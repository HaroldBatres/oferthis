import { neon } from "@neondatabase/serverless";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ChollazosDelDia from "@/app/components/ChollazosDelDia";
import StoreSection from "@/app/components/StoreSection";
import Benefits from "@/components/Benefits";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

export default async function HomePage() {
  const chollazos = await sql`
    SELECT *
    FROM productos
    WHERE imagen IS NOT NULL
    ORDER BY id DESC
    LIMIT 6
  `;

  const ebay = await sql`
    SELECT DISTINCT ON (nombre) *
    FROM productos
    WHERE tienda ILIKE '%ebay%'
    ORDER BY nombre
    LIMIT 8
  `;

  const aliexpress = await sql`
    SELECT DISTINCT ON (nombre) *
    FROM productos
    WHERE tienda ILIKE '%aliexpress%'
    ORDER BY nombre
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
    </main>
  );
}