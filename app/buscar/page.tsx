import Link from "next/link";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { sql } from "../lib/db";
import { searchEbayOfertas } from "../services/ebay";
import FavoriteButton from "../components/FavoriteButton";
import DiscountBadge from "../components/DiscountBadge";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  if (!query) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-2xl font-bold">Buscar ofertas</h1>
          <p className="text-gray-500 mt-2">Escribe algo en el buscador.</p>
        </main>
        <Footer />
      </>
    );
  }

  const locales = (await sql`
    SELECT * FROM productos
    WHERE disponible IS DISTINCT FROM false
      AND (
        nombre ILIKE ${"%" + query + "%"}
        OR categoria ILIKE ${"%" + query + "%"}
        OR tienda ILIKE ${"%" + query + "%"}
      )
    ORDER BY id DESC
    LIMIT 50
  `) as any[];

  let ebay: Awaited<ReturnType<typeof searchEbayOfertas>> = [];
  try {
    ebay = await searchEbayOfertas(query, 100);
  } catch (e) {
    console.error("Búsqueda eBay:", e);
  }

  const vistos = new Set(
    locales.map((p) => String(p.nombre || "").toLowerCase())
  );

  const ebayUnicos = ebay.filter((item) => {
    const key = item.title.toLowerCase();
    if (vistos.has(key)) return false;
    vistos.add(key);
    return true;
  });

  const total = locales.length + ebayUnicos.length;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Resultados para “{query}”
        </h1>
        <p className="text-gray-500 mb-8">
          {total} ofertas (Oferthis + eBay en vivo)
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {locales.map((p: any) => (
            <Link
              key={`local-${p.id}`}
              href={`/producto/${p.id}`}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="relative overflow-hidden rounded-t-xl">
                <Image
                  src={p.imagen}
                  alt={p.nombre}
                  width={300}
                  height={300}
                  unoptimized
                  className="w-full h-40 object-cover"
                />
                <DiscountBadge descuento={p.descuento || ""} />
                <div className="absolute top-2 right-2 z-20">
                  <FavoriteButton productId={p.id} />
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-semibold line-clamp-2">{p.nombre}</h3>
                <p className="text-orange-500 font-bold text-sm mt-1">
                  {p.precio}
                </p>
              </div>
            </Link>
          ))}

          {ebayUnicos.map((item) => (
            <a
              key={`ebay-${item.itemId}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="relative overflow-hidden rounded-t-xl">
                {item.imagen && (
                  <Image
                    src={item.imagen}
                    alt={item.title}
                    width={300}
                    height={300}
                    unoptimized
                    className="w-full h-40 object-cover"
                  />
                )}
                <DiscountBadge descuento={item.descuento || ""} />
                <span className="absolute bottom-2 left-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded">
                  eBay
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-semibold line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-orange-500 font-bold text-sm mt-1">
                  {item.precio}
                </p>
                {item.antes && (
                  <p className="text-gray-400 text-xs line-through">
                    {item.antes}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>

        {total === 0 && (
          <p className="text-gray-500">No hay resultados para esa búsqueda.</p>
        )}
      </main>
      <Footer />
    </>
  );
}