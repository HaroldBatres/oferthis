import Link from "next/link";
import Image from "next/image";
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
        <main className="mx-auto max-w-7xl px-4 py-16">
          <h1 className="text-2xl font-bold text-white">Buscar ofertas</h1>
          <p className="mt-2 text-gray-400">Escribe algo en el buscador.</p>
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
      <style>{`
        .foto-zoom {
          overflow: hidden;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }
        .foto-zoom-inner {
          height: 100%;
          width: 100%;
          transform: scale(1);
          transition: transform 0.35s ease;
        }
        .buscar-card:hover .foto-zoom-inner {
          transform: scale(1.2);
        }
      `}</style>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
          Resultados para “{query}”
        </h1>
        <p className="mb-8 text-gray-400">
          {total} ofertas (Oferthis + eBay en vivo)
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {locales.map((p: any) => (
            <Link
              key={`local-${p.id}`}
              href={`/producto/${p.id}`}
              className="buscar-card group rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm"
            >
              <div className="foto-zoom relative h-40">
                <div className="foto-zoom-inner">
                  <Image
                    src={p.imagen}
                    alt={p.nombre}
                    width={300}
                    height={300}
                    unoptimized
                    className="h-40 w-full object-cover"
                  />
                </div>
                <DiscountBadge descuento={p.descuento || ""} />
                <div className="absolute right-2 top-2 z-20">
                  <FavoriteButton productId={p.id} />
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-xs font-semibold text-gray-900">
                  {p.nombre}
                </h3>
                <p className="mt-1 text-sm font-bold text-orange-600">
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
              className="buscar-card group rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm"
            >
              <div className="foto-zoom relative h-40">
                {item.imagen && (
                  <div className="foto-zoom-inner">
                    <Image
                      src={item.imagen}
                      alt={item.title}
                      width={300}
                      height={300}
                      unoptimized
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
                <DiscountBadge descuento={item.descuento || ""} />
                <span className="absolute bottom-2 left-2 z-20 rounded bg-blue-600 px-2 py-0.5 text-[10px] text-white">
                  eBay
                </span>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-xs font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm font-bold text-orange-600">
                  {item.precio}
                </p>
                {item.antes && (
                  <p className="text-xs text-gray-500 line-through">
                    {item.antes}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>

        {total === 0 && (
          <p className="text-gray-400">No hay resultados para esa búsqueda.</p>
        )}
      </main>
      <Footer />
    </>
  );
}