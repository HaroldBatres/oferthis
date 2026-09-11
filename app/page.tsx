import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import StoreSection from "./components/StoreSection";
import { sql } from "./lib/db";
import NewsletterForm from "./components/NewsletterForm";
import VideosOferthis from "./components/VideosOferthis";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Oferthis - Las mejores ofertas de Amazon, eBay, AliExpress y SHEIN",
  description:
    "Descubre las mejores ofertas y descuentos actualizados de Amazon, eBay, AliExpress, SHEIN y más. Ahorra dinero todos los días con Oferthis.",
};

export default async function Home() {
  const deEbay = (await sql`
    SELECT * FROM productos
    WHERE LOWER(tienda) = 'ebay'
      AND (disponible = true OR disponible IS NULL)
    ORDER BY
      COALESCE(
        NULLIF(regexp_replace(COALESCE(descuento, ''), '[^0-9]', '', 'g'), ''),
        '0'
      )::int DESC,
      id DESC
    LIMIT 8
  `) as any[];

   const deAli = (await sql`
    SELECT * FROM (
      SELECT DISTINCT ON (nombre) *
      FROM productos
      WHERE tienda ILIKE ${"%AliExpress%"}
         OR tienda ILIKE ${"%Ali Express%"}
      ORDER BY nombre, id DESC
    ) t
    ORDER BY
      COALESCE(
        NULLIF(regexp_replace(COALESCE(descuento, ''), '[^0-9]', '', 'g'), ''),
        '0'
      )::int DESC,
      id DESC
    LIMIT 8
  `) as any[];

  const deAmazon = (await sql`
    SELECT * FROM productos
    WHERE LOWER(tienda) = 'amazon'
      AND (disponible = true OR disponible IS NULL)
    ORDER BY
      COALESCE(
        NULLIF(regexp_replace(COALESCE(descuento, ''), '[^0-9]', '', 'g'), ''),
        '0'
      )::int DESC,
      id DESC
    LIMIT 8
  `) as any[];

  return (
    <main>
      <Header />
      <Hero />
      <Categories />
      <VideosOferthis />
      <StoreSection tienda="eBay" productos={deEbay} color="blue" plano />
      <StoreSection tienda="AliExpress" productos={deAli} color="orange" plano />
      <StoreSection tienda="Amazon" productos={deAmazon} color="orange" plano />
      <Benefits />
      <section className="max-w-7xl mx-auto px-6 py-16">
        <NewsletterForm />
      </section>
      <Footer />
    </main>
  );
}