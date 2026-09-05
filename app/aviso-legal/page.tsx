import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Aviso legal",
};

export default function AvisoLegalPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-900">
        <h1 className="text-3xl font-bold mb-6">Aviso legal</h1>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Este sitio web, <strong>oferthis.com</strong>, es titularidad de:
          </p>
          <p>
            <strong>Titular:</strong> Harold Mauricio Martinez Batres<br />
            <strong>NIF/NIE:</strong> Y5229796R<br />
            <strong>Domicilio:</strong> Av. Alfonso IX de Leon, Salamanca<br />
            <strong>Email:</strong> contacto@oferthis.com
          </p>
          <p>
            Oferthis es un portal informativo de ofertas. No vende productos
            ni gestiona pagos. Las compras se realizan en tiendas de terceros
            (Amazon, eBay, AliExpress u otras).
          </p>
          <p>
            El uso de este sitio implica la aceptación de este aviso, la
            política de privacidad y la política de cookies.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}