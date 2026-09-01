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
    <section className="w-full bg-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {categorias.map((categoria) => (
            <Link
              key={categoria.slug}
              href={`/categoria/${categoria.slug}`}
                            className="bg-white rounded-xl px-2 py-2 shadow-sm border-2 border-black hover:shadow-xl hover:brightness-110 hover:-translate-y-0.5 transition duration-200 text-center"
            >
              <div className="text-xl leading-none">{categoria.icono}</div>
              <span className="block text-[11px] font-semibold text-gray-800 mt-1">
                {t(categoria.key)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}