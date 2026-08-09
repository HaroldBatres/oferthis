import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import { sql } from "./lib/db";
import NewsletterForm from "./components/NewsletterForm";

export const metadata = {
  title: "Oferthis - Las mejores ofertas de Amazon, eBay, AliExpress y SHEIN",
  description:
    "Descubre las mejores ofertas y descuentos actualizados de Amazon, eBay, AliExpress, SHEIN y más. Ahorra dinero todos los días con Oferthis.",
};

export default async function Home() {
  const productos = (await sql`
    SELECT * FROM productos 
    WHERE disponible = true OR disponible IS NULL
    ORDER BY id
  `) as any;

  return (
    <main>
      <Header />
      <Hero />
      <Categories />
      <Products productos={productos} />
      <Benefits />
      <section className="max-w-7xl mx-auto px-6 py-16">
        <NewsletterForm />
      </section>
      <Footer />
    </main>
  );
}