import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import StoreSection from "./components/StoreSection";
import { sql } from "./lib/db";

export const metadata = {
  title: "Oferthis - Las mejores ofertas de Amazon, eBay, AliExpress y SHEIN",
  description:
    "Descubre las mejores ofertas y descuentos actualizados de Amazon, eBay, AliExpress, SHEIN y más. Ahorra dinero todos los días con Oferthis.",
};

function esOferta(p: any) {
  const d = String(p.descuento || "");
  return d && d !== "-0%" && d !== "0%" && d !== "";
}

export default async function Home() {
  const productos = (await sql`
    SELECT * FROM productos
    WHERE disponible = true OR disponible IS NULL
    ORDER BY id DESC
  `) as any[];

  const deAmazon = productos.filter(
    (p) => (p.tienda || "").toLowerCase() === "amazon"
  );

  // Solo ofertas con descuento real, máximo 10 (2 filas × 5)
  const deEbay = productos
    .filter(
      (p) => (p.tienda || "").toLowerCase() === "ebay" && esOferta(p)
    )
    .slice(0, 10);

  const deAli = productos
    .filter(
      (p) =>
        ((p.tienda || "").toLowerCase() === "aliexpress" ||
          (p.tienda || "").toLowerCase() === "ali express") &&
        esOferta(p)
    )
    .slice(0, 10);

  return (
    <main>
      <Header />
      <Hero />
      <Categories />

      <StoreSection tienda="Amazon" productos={deAmazon} color="orange" />
      <StoreSection
        tienda="eBay"
        productos={deEbay}
        color="blue"
        plano
      />
      <StoreSection
        tienda="AliExpress"
        productos={deAli}
        color="red"
        plano
      />

      <Benefits />
      <Footer />
    </main>
  );
}