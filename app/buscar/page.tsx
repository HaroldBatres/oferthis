import Link from "next/link";
import Image from "next/image";
import productos from "../data/products";
import type { Producto } from "../models/product";

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.toLowerCase().trim() || "";

  const resultados = query
    ? productos.filter(
        (p: Producto) =>
          p.nombre.toLowerCase().includes(query) ||
          p.categoria.toLowerCase().includes(query) ||
          p.tienda.toLowerCase().includes(query)
      )
    : [];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      {/* Botón volver */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
      >
        <span className="text-lg">←</span>
        Volver a las ofertas
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Resultados de búsqueda
        </h1>
        <p className="text-gray-500">
          {query
            ? `${resultados.length} resultado${resultados.length !== 1 ? "s" : ""} para “${q}”`
            : "Escribe algo en el buscador para encontrar ofertas"}
        </p>
      </div>

      {resultados.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            No se encontraron productos.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-orange-500 font-semibold hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resultados.map((item: Producto) => (
            <Link
              key={item.id}
              href={`/producto/${item.id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={item.imagen}
                  alt={item.nombre}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded">
                  {item.descuento}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-orange-500 transition">
                  {item.nombre}
                </h3>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-orange-500 font-bold text-lg">
                    {item.precio}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {item.antes}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}