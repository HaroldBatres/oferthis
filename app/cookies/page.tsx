import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Política de cookies",
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-900">
        <h1 className="text-3xl font-bold mb-6">Política de cookies</h1>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Usamos cookies y almacenamiento local necesarios para el
            funcionamiento (sesión de Clerk y tu elección de cookies).
          </p>
          <p>
            No instalamos cookies de publicidad propia. Si en el futuro
            añadimos analítica, pediremos permiso en el banner.
          </p>
          <p>
            Puedes borrar la elección en tu navegador (datos del sitio
            oferthis.com) y el aviso volverá a salir.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}