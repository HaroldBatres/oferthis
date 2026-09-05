import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Política de privacidad",
};

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-900">
        <h1 className="text-3xl font-bold mb-6">Política de privacidad</h1>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Responsable: Harold Mauricio Martinez Batres, NIF Y5229796R, email contacto@oferthis.com.
          </p>
          <p>
            Tratamos datos para: cuenta de usuario (Clerk), comentarios,
            favoritos, alertas de precio y newsletter si te suscribes.
          </p>
          <p>
            Proveedores: Clerk (inicio de sesión), Neon (base de datos),
            Vercel (alojamiento), Resend (emails) y tiendas de afiliados
            cuando pulsas “Comprar”.
          </p>
          <p>
            Base legal: tu consentimiento, ejecución de la cuenta y
            interés legítimo en la seguridad del sitio.
          </p>
          <p>
            Derechos: acceso, rectificación, supresión, oposición y
            portabilidad. Escríbenos a contacto@oferthis.com. También puedes
            reclamar ante la AEPD (aepd.es).
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}