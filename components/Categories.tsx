import Link from "next/link";
import { getTranslations } from "next-intl/server";

const categorias = [
  { key: "cat_tecnologia", slug: "tecnologia", icono: "💻" },
  { key: "cat_hogar", slug: "hogar", icono: "🏠" },
  { key: "cat_gaming", slug: "gaming", icono: "🎮" },
  { key: "cat_deporte", slug: "deporte", icono: "⚽" },
  { key: "cat_cocina", slug: "cocina", icono: "🍳" },
  { key: "cat_moda", slug: "moda", icono: "👕" },
  { key: "cat_belleza", slug: "belleza", icono: "💄" },
  { key: "cat_mascotas", slug: "mascotas", icono: "🐾" },
] as const;

export default async function Categories() {
  const t = await getTranslations("Home");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h3 className="text-3xl md:text-4xl font-bold mb-10 text-white">
  {t("categories")}
</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {categorias.map((categoria) => (
          <Link
            key={categoria.slug}
            href={`/categoria/${categoria.slug}`}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-300 hover:-translate-y-0.5 transition text-center"
          >
            <div className="text-3xl sm:text-4xl mb-2">{categoria.icono}</div>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">
              {t(categoria.key)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}