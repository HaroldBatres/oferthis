import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Footer from "@/components/Footer";
import FavoriteButton from "../../components/FavoriteButton";
import DiscountBadge from "../../components/DiscountBadge";
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
  casadellibro: "Casa del Libro",
  mibro: "Mibro",
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

function catKey(nombre: string): string {
  const map: Record<string, string> = {
    Tecnología: "cat_tecnologia",
    Tecnologia: "cat_tecnologia",
    Hogar: "cat_hogar",
    Gaming: "cat_gaming",
    Deporte: "cat_deporte",
    Cocina: "cat_cocina",
    Moda: "cat_moda",
    Belleza: "cat_belleza",
    Mascotas: "cat_mascotas",
    Automocion: "cat_automocion",
    Herramientas: "cat_herramientas",
    Libros: "cat_libros",
  };
  return map[nombre] || "";
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const nombre = NOMBRES[slug.toLowerCase()] || slug;
  return {
    title: `${nombre} | Oferthis`,
    description: `Ofertas de ${nombre} en Oferthis`,
  };
}

export default async function TiendaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q, orden, min, max, soloOfertas } = await searchParams;
  const tHome = await getTranslations("Home");

  const nombreTienda = NOMBRES[slug.toLowerCase()] || slug;

  let productos = (await sql`
    SELECT * FROM productos
    WHERE tienda ILIKE ${"%" + nombreTienda + "%"}
      AND (disponible = true OR disponible IS NULL)
      AND imagen IS NOT NULL
    ORDER BY descuento DESC NULLS LAST, id DESC
  `) as any[];

  if (q) {
    const ql = q.toLowerCase();
    productos = productos.filter(
      (p) =>
        String(p.nombre || "").toLowerCase().includes(ql) ||
        String(p.categoria || "").toLowerCase().includes(ql)
    );
  }

  if (soloOfertas === "1") {
    productos = productos.filter((p) => {
      const d = String(p.descuento || "");
      return d && d !== "-0%" && d !== "0%";
    });
  }

  if (min || max) {
    const minN = min ? parseFloat(min) : 0;
    const maxN = max ? parseFloat(max) : Infinity;
    productos = productos.filter((p) => {
      const n = parsePrecio(p.precio);
      return n >= minN && n <= maxN;
    });
  }

  if (orden === "precio_asc") {
    productos.sort((a, b) => parsePrecio(a.precio) - parsePrecio(b.precio));
  } else if (orden === "precio_desc") {
    productos.sort((a, b) => parsePrecio(b.precio) - parsePrecio(a.precio));
  } else if (orden === "descuento") {
    productos.sort((a, b) => {
      const da = parseInt(String(a.descuento || "0").replace(/\D/g, "")) || 0;
      const db = parseInt(String(b.descuento || "0").replace(/\D/g, "")) || 0;
      return db - da;
    });
  }

  const porCategoria: Record<string, any[]> = {};
  for (const p of productos) {
    const cat = p.categoria || "Otros";
    if (!porCategoria[cat]) porCategoria[cat] = [];
    porCategoria[cat].push(p);
  }
  const categorias = Object.keys(porCategoria).sort();

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-orange-400 hover:text-orange-300">
            ← Volver
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">{nombreTienda}</h1>
          <p className="mt-1 text-gray-400">{productos.length} productos</p>
        </div>

        <form className="mb-8 flex flex-wrap items-center gap-3">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar..."
            className="rounded-xl border border-white/20 bg-[#0c1222] px-4 py-2 text-sm text-white"
          />
          <input
            name="min"
            type="number"
            defaultValue={min || ""}
            placeholder="Min €"
            className="w-24 rounded-xl border border-white/20 bg-[#0c1222] px-3 py-2 text-sm text-white"
          />
          <input
            name="max"
            type="number"
            defaultValue={max || ""}
            placeholder="Max €"
            className="w-24 rounded-xl border border-white/20 bg-[#0c1222] px-3 py-2 text-sm text-white"
          />
          <select
            name="orden"
            defaultValue={orden || ""}
            className="rounded-xl border border-white/20 bg-[#0c1222] px-3 py-2 text-sm text-white"
          >
            <option value="">Ordenar</option>
            <option value="precio_asc">Precio ↑</option>
            <option value="precio_desc">Precio ↓</option>
            <option value="descuento">Descuento</option>
          </select>
          <label className="flex items-center gap-2 whitespace-nowrap px-2 text-sm font-medium text-white">
            <input
              type="checkbox"
              name="soloOfertas"
              value="1"
              defaultChecked={soloOfertas === "1"}
              className="rounded border-gray-800"
            />
            Solo ofertas
          </label>
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Filtrar
          </button>
        </form>

        {productos.length === 0 ? (
          <p className="text-gray-400">No hay productos</p>
        ) : (
          <div className="space-y-12">
            {categorias.map((cat) => {
              const key = catKey(cat);
              const titulo = key ? tHome(key as any) : cat;
              return (
                <div key={cat}>
                  <h2 className="mb-4 border-b border-white/20 pb-2 text-xl font-semibold text-white">
                    {titulo}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {porCategoria[cat].map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/producto/${p.id}`}
                        className="group rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm transition hover:shadow-md"
                      >
                        <div className="relative overflow-hidden rounded-t-xl">
                          <Image
                            src={p.imagen}
                            alt={p.nombre}
                            width={240}
                            height={240}
                            unoptimized
                            className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <DiscountBadge descuento={p.descuento} />
                          <div className="absolute top-2 right-2">
                            <FavoriteButton productId={p.id} />
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-orange-500">
                            {p.nombre}
                          </h3>
                          <p className="mt-1 font-bold text-orange-600">{p.precio}</p>
                          {p.antes && p.antes !== p.precio && (
                            <p className="text-xs text-gray-400 line-through">{p.antes}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}