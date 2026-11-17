import Link from "next/link";
import { notFound } from "next/navigation";
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
  casadellibro: "Casa del Libro",
  mibro: "Mibro",
};

// Valor exacto de la columna "tienda" en la base de datos.
const TIENDA_DB: Record<string, string> = {
  amazon: "Amazon",
  ebay: "eBay",
  aliexpress: "AliExpress",
  casadellibro: "CasaDelLibro",
  mibro: "Mibro",
};

// Descuento numérico seguro: "-35%" -> 35, "0%" / "" / NULL -> 0.
const SQL_DESC_NUM = `COALESCE(LEFT(SUBSTRING(descuento FROM '[0-9]+'), 3)::INTEGER, 0)`;

// Productos que se enseñan por categoría antes de "Ver todos".
const POR_CATEGORIA = 20;

function slugCategoria(cat: string) {
  return cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

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
  const key = slug.toLowerCase();
  const nombre = NOMBRES[key];
  if (!nombre) {
    return { title: "Tienda no encontrada" };
  }
  return {
    // El layout ya añade " | Oferthis" con su plantilla de título.
    title: nombre,
    description: `Ofertas de ${nombre} en Oferthis`,
    alternates: {
      canonical: `https://www.oferthis.com/tienda/${key}`,
    },
  };
}

export default async function TiendaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q, orden, min, max, soloOfertas } = await searchParams;
  const tHome = await getTranslations("Home");

  const nombreTienda = NOMBRES[slug.toLowerCase()];
  if (!nombreTienda) {
    notFound();
  }

  const slugKey = slug.toLowerCase();
  const tiendaDb = TIENDA_DB[slugKey];

  // Un producto por nombre (el de mayor descuento real), primero las ofertas con más descuento.
  let productos = (await sql`
    SELECT * FROM (
      SELECT DISTINCT ON (lower(trim(nombre))) *
      FROM productos
      WHERE tienda = ${tiendaDb}
        AND (disponible = true OR disponible IS NULL)
        AND imagen IS NOT NULL
        AND imagen <> ''
        AND nombre NOT ILIKE '%prueba%'
      ORDER BY lower(trim(nombre)), ${sql.unsafe(SQL_DESC_NUM)} DESC, id DESC
    ) t
    ORDER BY ${sql.unsafe(SQL_DESC_NUM)} DESC, id DESC
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
  // Categorías con más productos primero; "Otros" siempre al final.
  const categorias = Object.keys(porCategoria).sort((a, b) => {
    if (a === "Otros") return 1;
    if (b === "Otros") return -1;
    return porCategoria[b].length - porCategoria[a].length || a.localeCompare(b, "es");
  });
  const filtrando = Boolean(q || min || max);

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
                    {(filtrando ? porCategoria[cat] : porCategoria[cat].slice(0, POR_CATEGORIA)).map((p: any) => (
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
                  {!filtrando && porCategoria[cat].length > POR_CATEGORIA && (
                    <Link
                      href={`/categoria/${slugCategoria(cat)}?tienda=${encodeURIComponent(tiendaDb)}&orden=descuento`}
                      className="mt-4 inline-block text-sm font-semibold text-orange-400 hover:text-orange-300"
                    >
                      Ver los {porCategoria[cat].length} productos de {titulo} →
                    </Link>
                  )}
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