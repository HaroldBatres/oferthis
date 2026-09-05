import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Aviso de afiliados",
};

export default function AfiliadosPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-900">
        <h1 className="text-3xl font-bold mb-6">Aviso de afiliados</h1>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Oferthis participa en el Programa de Afiliados de Amazon EU
            y en programas similares de eBay, AliExpress u otras tiendas.
          </p>
          <p>
            Como Afiliado de Amazon, obtengo ingresos por las compras
            adscritas que cumplen los requisitos aplicables. Eso significa
            que si compras a través de un enlace de Oferthis, podemos
            recibir una comisión, sin coste extra para ti.
          </p>
          <p>
            Los precios y la disponibilidad los fija cada tienda y pueden
            cambiar. Oferthis no vende ni cobra el producto.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}