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
  };
  return map[nombre] || "";
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("Store");
  const nombre = NOMBRES[slug.toLowerCase()] || slug;
  return {
    title: t("metaTitle", { nombre }),
    description: t("metaDescription", { nombre }),
  };
}

export default async function TiendaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q, orden, min, max, soloOfertas } = await searchParams;
  const t = await getTranslations("Store");
  const tHome = await getTranslations("Home");
  const tCommon = await getTranslations("Common");

  const slugLower = slug.toLowerCase();
  const nombreTienda = NOMBRES[slugLower] || slug;

  let productos = (await sql`
    SELECT * FROM productos
    WHERE (disponible = true OR disponible IS NULL)
      AND LOWER(tienda) = ${slugLower}
    ORDER BY id DESC
  `) as any[];

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    productos = productos.filter((p) =>
      String(p.nombre || "").toLowerCase().includes(term)
    );
  }

  const minN = min ? parseFloat(min) : null;
  if (minN != null && !Number.isNaN(minN)) {
    productos = productos.filter((p) => parsePrecio(p.precio) >= minN);
  }

  const maxN = max ? parseFloat(max) : null;
  if (maxN != null && !Number.isNaN(maxN)) {
    productos = productos.filter((p) => parsePrecio(p.precio) <= maxN);
  }

  if (soloOfertas === "1") {
    productos = productos.filter((p) => {
      const d = String(p.descuento || "");
      return d && d !== "-0%" && d !== "0%" && d !== "";
    });
  }

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-600 hover:text-orange-500"
        >
          ← {tCommon("backToOffers")}
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {t("offersOf")} <span className="text-orange-500">{nombreTienda}</span>
        </h1>
        <p className="text-gray-500 mb-6">
          {productos.length}{" "}
          {productos.length === 1 ? t("product") : t("products")}
        </p>

                <form
          method="get"
          action={base}
          className="mb-10 flex flex-col md:flex-row flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:border-orange-400 hover:shadow-[0_0_28px_rgba(249,115,22,0.45)]"
        >
          <input
            type="search"
            name="q"
            defaultValue={q || ""}
            placeholder={t("searchProduct")}
            className="min-w-[180px] flex-1 rounded-xl border-2 border-gray-800 bg-white px-4 py-2.5 text-sm font-medium text-black placeholder:text-gray-600 outline-none transition hover:border-orange-500 hover:shadow-[0_0_16px_rgba(249,115,22,0.4)] focus:border-orange-500 focus:shadow-[0_0_18px_rgba(249,115,22,0.5)]"
          />
          <input
            type="number"
            name="min"
            defaultValue={min || ""}
            placeholder={t("priceMin")}
            min={0}
            step={1}
            className="w-full rounded-xl border-2 border-gray-800 bg-white px-3 py-2.5 text-sm font-medium text-black placeholder:text-gray-600 outline-none transition hover:border-orange-500 md:w-28"
          />
          <input
            type="number"
            name="max"
            defaultValue={max || ""}
            placeholder={t("priceMax")}
            min={0}
            step={1}
            className="w-full rounded-xl border-2 border-gray-800 bg-white px-3 py-2.5 text-sm font-medium text-black placeholder:text-gray-600 outline-none transition hover:border-orange-500 md:w-28"
          />
          <select
            name="orden"
            defaultValue={orden || ""}
            className="rounded-xl border-2 border-gray-800 bg-white px-3 py-2.5 text-sm font-medium text-black outline-none transition hover:border-orange-500"
          >
            <option value="">{t("orderRecent")}</option>
            <option value="precio">{t("orderPrice")}</option>
            <option value="descuento">{t("orderDiscount")}</option>
          </select>
          <label className="flex items-center gap-2 whitespace-nowrap px-2 text-sm font-medium text-black">
            <input
              type="checkbox"
              name="soloOfertas"
              value="1"
              defaultChecked={soloOfertas === "1"}
              className="rounded border-gray-800"
            />
            {t("onlyDeals")}
          </label>
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            {t("filter")}
          </button>
        </form>

        {productos.length === 0 ? (
          <p className="text-gray-500">{t("empty")}</p>
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
                          <DiscountBadge descuento={p.descuento} />
                          <div className="absolute top-2 right-2">
                            <FavoriteButton productId={p.id} />
                          </div>
                        </div>
                        <div className="p-3">
                                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-orange-500">
                            {p.nombre}
                          </h3>
                              <p className="mt-1 font-bold text-orange-600">
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
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}