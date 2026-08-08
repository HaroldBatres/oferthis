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
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h3 className="text-3xl md:text-4xl font-bold mb-10">
        Explora categorías
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categorias.map((categoria) => (
          <Link
            key={categoria.slug}
            href={`/categoria/${categoria.slug}`}
            className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md hover:border-orange-200 transition text-center font-semibold"
          >
            <div className="text-3xl mb-3">📦</div>
            {categoria.nombre}
          </Link>
        ))}
      </div>
    </section>
  );
}