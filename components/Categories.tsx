import Link from "next/link";

const categorias = [
  { nombre: "Tecnología", slug: "tecnologia" },
  { nombre: "Hogar", slug: "hogar" },
  { nombre: "Gaming", slug: "gaming" },
  { nombre: "Deporte", slug: "deporte" },
  { nombre: "Cocina", slug: "cocina" },
  { nombre: "Moda", slug: "moda" },
  { nombre: "Belleza", slug: "belleza" },
  { nombre: "Mascotas", slug: "mascotas" },
];

export default function Categories() {
  return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-10 text-gray-900">
        Explora categorías
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {categorias.map((categoria) => (
          <Link
            key={categoria.slug}
            href={`/categoria/${categoria.slug}`}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 transition text-center font-semibold text-gray-900"
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📦</div>
            <span className="text-sm sm:text-base text-gray-900">
              {categoria.nombre}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}