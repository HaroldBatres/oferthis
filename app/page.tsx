import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import StoreSection from "./components/StoreSection";
import { sql } from "./lib/db";
import NewsletterForm from "./components/NewsletterForm";

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
    LIMIT 60
  `) as any[];

  const deAli = (await sql`
    SELECT * FROM productos
    WHERE LOWER(tienda) = 'aliexpress'
      AND (disponible = true OR disponible IS NULL)
    ORDER BY
      COALESCE(
        NULLIF(regexp_replace(COALESCE(descuento, ''), '[^0-9]', '', 'g'), ''),
        '0'
      )::int DESC,
      id DESC
    LIMIT 60
  `) as any[];

  return (
    <main>
      <Header />
      <Hero />
      <Categories />
      <StoreSection tienda="eBay" productos={deEbay} color="blue" plano />
           <StoreSection tienda="AliExpress" productos={deAli} color="orange" plano />
      <Benefits />
      <section className="max-w-7xl mx-auto px-6 py-16">
        <NewsletterForm />
      </section>
      <Footer />
    </main>
  );
}