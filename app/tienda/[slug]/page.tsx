import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteButton from "../../components/FavoriteButton";
import { sql } from "../../lib/db";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    orden?: string;
    min?: string;
    max?: string;
    soloOfertas?: string;
  }>;
};

const NOMBRES: Record<string, string> = {
  amazon: "Amazon",
  ebay: "eBay",
  aliexpress: "AliExpress",
  shein: "SHEIN",
};

function parsePrecio(p: string): number {
  return (
    parseFloat(
      String(p || "0")
        .replace("€", "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    ) || 0
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const nombre = NOMBRES[slug.toLowerCase()] || slug;
  return {
    title: `Ofertas de ${nombre} | Oferthis`,
    description: `Todas las ofertas de ${nombre} en Oferthis.`,
  };
}

export default async function TiendaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q, orden, min, max, soloOfertas } = await searchParams;
  const slugLower = slug.toLowerCase();
  const nombreTienda = NOMBRES[slugLower] || slug;

  // TODOS los productos de la tienda (disponibles)
  let productos = (await sql`
    SELECT * FROM productos
    WHERE (disponible = true OR disponible IS NULL)
      AND LOWER(tienda) = ${slugLower}
    ORDER BY id DESC
  `) as any[];

  // Buscador por nombre
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    productos = productos.filter((p) =>
      String(p.nombre || "").toLowerCase().includes(term)
    );
  }

  // Precio mínimo
  const minN = min ? parseFloat(min) : null;
  if (minN != null && !Number.isNaN(minN)) {
    productos = productos.filter((p) => parsePrecio(p.precio) >= minN);
  }

  // Precio máximo
  const maxN = max ? parseFloat(max) : null;
  if (maxN != null && !Number.isNaN(maxN)) {
    productos = productos.filter((p) => parsePrecio(p.precio) <= maxN);
  }

  // Solo ofertas (con descuento real)
  if (soloOfertas === "1") {
    productos = productos.filter((p) => {
      const d = String(p.descuento || "");
      return d && d !== "-0%" && d !== "0%" && d !== "";
    });
  }

  // Orden
  if (orden === "precio") {
    productos = [...productos].sort(
      (a, b) => parsePrecio(a.precio) - parsePrecio(b.precio)
    );
  } else if (orden === "descuento") {
    productos = [...productos].sort((a, b) => {
      const da = parseInt(String(a.descuento).replace(/\D/g, "") || "0");
      const db = parseInt(String(b.descuento).replace(/\D/g, "") || "0");
      return db - da;
    });
  }

  // Agrupar por categoría
  const porCategoria: Record<string, any[]> = {};
  for (const p of productos) {
    const cat = p.categoria || "Otros";
    if (!porCategoria[cat]) porCategoria[cat] = [];
    porCategoria[cat].push(p);
  }
  const categorias = Object.keys(porCategoria).sort();

  const base = `/tienda/${slugLower}`;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-600 hover:text-orange-500"
        >
          ← Volver a las ofertas
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Ofertas de <span className="text-orange-500">{nombreTienda}</span>
        </h1>
        <p className="text-gray-500 mb-6">
          {productos.length}{" "}
          {productos.length === 1 ? "producto" : "productos"}
        </p>

        {/* Buscador y filtros */}
        <form
          method="get"
          action={base}
          className="mb-10 flex flex-col md:flex-row flex-wrap gap-3 p-4 bg-gray-50 rounded-2xl border"
        >
          <input
            type="search"
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar producto..."
            className="flex-1 min-w-[180px] rounded-xl border px-4 py-2.5 text-sm"
          />
          <input
            type="number"
            name="min"
            defaultValue={min || ""}
            placeholder="Precio mín €"
            min={0}
            step={1}
            className="w-full md:w-28 rounded-xl border px-3 py-2.5 text-sm"
          />
          <input
            type="number"
            name="max"
            defaultValue={max || ""}
            placeholder="Precio máx €"
            min={0}
            step={1}
            className="w-full md:w-28 rounded-xl border px-3 py-2.5 text-sm"
          />
          <select
            name="orden"
            defaultValue={orden || ""}
            className="rounded-xl border px-3 py-2.5 text-sm"
          >
            <option value="">Orden: recientes</option>
            <option value="precio">Más barato</option>
            <option value="descuento">Mayor descuento</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap px-2">
            <input
              type="checkbox"
              name="soloOfertas"
              value="1"
              defaultChecked={soloOfertas === "1"}
              className="rounded border-gray-300"
            />
            Solo ofertas
          </label>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
          >
            Filtrar
          </button>
        </form>

        {productos.length === 0 ? (
          <p className="text-gray-500">
            No hay productos con esos filtros.
          </p>
        ) : (
          <div className="space-y-12">
            {categorias.map((cat) => (
              <div key={cat}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  {cat}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {porCategoria[cat].map((p: any) => (
                    <Link
                      key={p.id}
                      href={`/producto/${p.id}`}
                      className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      <div className="relative">
                        <Image
                          src={p.imagen}
                          alt={p.nombre}
                          width={240}
                          height={240}
                          unoptimized
                          className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                        />
                        {p.descuento &&
                          p.descuento !== "-0%" &&
                          p.descuento !== "0%" && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                              {p.descuento}
                            </span>
                          )}
                        <div className="absolute top-2 right-2">
                          <FavoriteButton productId={p.id} />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-orange-500">
                          {p.nombre}
                        </h3>
                        <p className="text-orange-500 font-bold mt-1">
                          {p.precio}
                        </p>
                        {p.antes && p.antes !== p.precio && (
                          <p className="text-xs text-gray-400 line-through">
                            {p.antes}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}