import Footer from "../../components/Footer";
import ProductCard from "../components/ProductCard";
import { sql } from "../lib/db";
import { searchEbayOfertas } from "../services/ebay";

type Props = {
  searchParams: Promise<{
    q?: string;
    autor?: string;
    min?: string;
    max?: string;
    orden?: string;
  }>;
};

function parsePrecio(p: unknown) {
  return (
    parseFloat(
      String(p || "0")
        .replace("€", "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
    ) || 0
  );
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q, autor, min, max, orden } = await searchParams;
  const query = (q || "").trim();
  const autorQ = (autor || "").trim().toLowerCase();
  const minN = min ? parseFloat(min) : null;
  const maxN = max ? parseFloat(max) : null;

  if (!query) {
    return (
      <>
        <main className="mx-auto max-w-7xl px-4 py-16">
          <h1 className="text-2xl font-bold text-white">Buscar ofertas</h1>
          <p className="mt-2 text-gray-400">Escribe algo en el buscador.</p>
        </main>
        <Footer />
      </>
    );
  }

  let locales = (await sql`
    SELECT * FROM productos
    WHERE disponible IS DISTINCT FROM false
      AND (
        nombre ILIKE ${"%" + query + "%"}
        OR categoria ILIKE ${"%" + query + "%"}
        OR tienda ILIKE ${"%" + query + "%"}
        OR COALESCE(autor, '') ILIKE ${"%" + query + "%"}
      )
    ORDER BY id DESC
    LIMIT 80
  `) as any[];

  if (autorQ) {
    locales = locales.filter((p) =>
      String(p.autor || "").toLowerCase().includes(autorQ)
    );
  }

  if (minN != null && !Number.isNaN(minN)) {
    locales = locales.filter((p) => parsePrecio(p.precio) >= minN);
  }

  if (maxN != null && !Number.isNaN(maxN)) {
    locales = locales.filter((p) => parsePrecio(p.precio) <= maxN);
  }

  if (orden === "precio") {
    locales = [...locales].sort(
      (a, b) => parsePrecio(a.precio) - parsePrecio(b.precio)
    );
  } else if (orden === "descuento") {
    locales = [...locales].sort((a, b) => {
      const da = parseInt(String(a.descuento || "").replace(/\D/g, "") || "0");
      const db = parseInt(String(b.descuento || "").replace(/\D/g, "") || "0");
      return db - da;
    });
  }

  let ebay: Awaited<ReturnType<typeof searchEbayOfertas>> = [];
  try {
    ebay = await searchEbayOfertas(query, 40);
  } catch (e) {
    console.error("Búsqueda eBay:", e);
  }

  const vistos = new Set(
    locales.map((p) => String(p.nombre || "").toLowerCase())
  );
  const ebayUnicos = ebay.filter((item) => {
    const key = String(item.title || "").toLowerCase();
    if (vistos.has(key)) return false;
    vistos.add(key);
    return true;
  });

  const total = locales.length + ebayUnicos.length;

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-bold text-white">
          Resultados para “{query}”
        </h1>
        <p className="mt-1 text-sm text-gray-400">{total} ofertas</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {locales.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}

          {ebayUnicos.map((item: any) => (
            <ProductCard
              key={`ebay-${item.itemId || item.title}`}
              product={{
                nombre: item.title,
                imagen: item.imagen,
                precio: item.precio,
                antes: item.antes,
                descuento: item.descuento,
                tienda: "eBay",
                url: item.url,
              }}
            />
          ))}
        </div>

        {total === 0 && (
          <p className="mt-8 text-gray-400">No hay resultados con esos filtros.</p>
        )}
      </main>
      <Footer />
    </>
  );
}