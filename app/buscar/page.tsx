import Link from "next/link";
import Image from "next/image";
import Footer from "../../components/Footer";
import { sql } from "../lib/db";
import { searchEbayOfertas } from "../services/ebay";
import FavoriteButton from "../components/FavoriteButton";
import DiscountBadge from "../components/DiscountBadge";

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
        OR autor ILIKE ${"%" + query + "%"}
      )
    ORDER BY id DESC
    LIMIT 80
  `) as any[];

  let ebay: Awaited<ReturnType<typeof searchEbayOfertas>> = [];
  try {
    ebay = await searchEbayOfertas(query, 100);
  } catch (e) {
    console.error("Búsqueda eBay:", e);
  }

  if (autorQ) {
    locales = locales.filter((p) =>
      `${p.nombre || ""} ${p.autor || ""}`.toLowerCase().includes(autorQ)
    );
  }

  if (minN != null && !Number.isNaN(minN)) {
    locales = locales.filter((p) => parsePrecio(p.precio) >= minN);
  }
  if (maxN != null && !Number.isNaN(maxN)) {
    locales = locales.filter((p) => parsePrecio(p.precio) <= maxN);
  }

  const vistos = new Set(
    locales.map((p) => String(p.nombre || "").toLowerCase())
  );

  let ebayUnicos = ebay.filter((item) => {
    const key = item.title.toLowerCase();
    if (vistos.has(key)) return false;
    vistos.add(key);
    if (autorQ && !key.includes(autorQ)) return false;
    const precio = parsePrecio(item.precio);
    if (minN != null && !Number.isNaN(minN) && precio < minN) return false;
    if (maxN != null && !Number.isNaN(maxN) && precio > maxN) return false;
    return true;
  });

  if (orden === "precio") {
    locales = [...locales].sort(
      (a, b) => parsePrecio(a.precio) - parsePrecio(b.precio)
    );
    ebayUnicos = [...ebayUnicos].sort(
      (a, b) => parsePrecio(a.precio) - parsePrecio(b.precio)
    );
  } else if (orden === "precio_desc") {
    locales = [...locales].sort(
      (a, b) => parsePrecio(b.precio) - parsePrecio(a.precio)
    );
    ebayUnicos = [...ebayUnicos].sort(
      (a, b) => parsePrecio(b.precio) - parsePrecio(a.precio)
    );
  }

  const total = locales.length + ebayUnicos.length;
  const campo =
    "rounded-xl border-2 border-gray-800 bg-white px-3 py-2.5 text-sm font-medium text-black placeholder:text-gray-500";

  return (
    <>
      <style>{`
        .foto-zoom { overflow: hidden; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; }
        .foto-zoom-inner { height: 100%; width: 100%; }
        .buscar-card:hover .foto-zoom-inner img { transform: scale(1.06); }
        .foto-zoom-inner img { transition: transform 0.3s ease; }
      `}</style>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
          Resultados para “{query}”
        </h1>
        <p className="mb-6 text-gray-400">
          {total} ofertas (Oferthis + eBay en vivo)
        </p>

        <form
          method="get"
          action="/buscar"
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white p-4 text-gray-900 md:flex-row md:flex-wrap md:items-center"
        >
          <input type="hidden" name="q" value={query} />
          <input
            type="search"
            name="autor"
            defaultValue={autor || ""}
            placeholder="Autor o palabra en el título"
            className={`min-w-[180px] flex-1 ${campo}`}
          />
          <input
            type="number"
            name="min"
            defaultValue={min || ""}
            placeholder="Precio mín. €"
            min={0}
            step={1}
            className={`w-full md:w-32 ${campo}`}
          />
          <input
            type="number"
            name="max"
            defaultValue={max || ""}
            placeholder="Precio máx. €"
            min={0}
            step={1}
            className={`w-full md:w-32 ${campo}`}
          />
          <select name="orden" defaultValue={orden || ""} className={campo}>
            <option value="">Más recientes</option>
            <option value="precio">Precio: más barato</option>
            <option value="precio_desc">Precio: más caro</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
          >
            Filtrar
          </button>
        </form>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {locales.map((p: any) => (
            <Link
              key={`local-${p.id}`}
              href={`/producto/${p.id}`}
              className="buscar-card group rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm"
            >
              <div className="foto-zoom relative flex h-52 items-center justify-center bg-white">
                <div className="foto-zoom-inner flex h-full w-full items-center justify-center">
                  <Image
                    src={p.imagen}
                    alt={p.nombre}
                    width={400}
                    height={400}
                    unoptimized
                    className="max-h-52 w-auto max-w-full object-contain p-2"
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
                {p.autor && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                    {p.autor}
                  </p>
                )}
                <p className="mt-1 text-sm font-bold text-orange-600">{p.precio}</p>
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
              <div className="foto-zoom relative flex h-52 items-center justify-center bg-white">
                {item.imagen && (
                  <div className="foto-zoom-inner flex h-full w-full items-center justify-center">
                    <Image
                      src={item.imagen}
                      alt={item.title}
                      width={400}
                      height={400}
                      unoptimized
                      className="max-h-52 w-auto max-w-full object-contain p-2"
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
                <p className="mt-1 text-sm font-bold text-orange-600">{item.precio}</p>
              </div>
            </a>
          ))}
        </div>

        {total === 0 && (
          <p className="text-gray-400">No hay resultados con esos filtros.</p>
        )}
      </main>
      <Footer />
    </>
  );
}