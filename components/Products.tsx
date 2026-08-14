"use client";

import Link from "next/link";
import FavoriteButton from "../app/components/FavoriteButton";

type Props = {
  productos: any[];
};

function parseDescuento(descuento: string) {
  if (!descuento) return 0;
  return parseInt(String(descuento).replace("%", "").replace("-", "")) || 0;
}

function ProductCard({ producto }: { producto: any }) {
  return (
    <Link href={`/producto/${producto.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full border border-gray-100">
        <div className="relative bg-gray-100 h-48 sm:h-56">
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton productId={producto.id} />
          </div>
          <img
            src={producto.imagen}
            alt={producto.nombre || "Producto"}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {producto.descuento && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded">
              {producto.descuento}
            </span>
          )}
        </div>

        <div className="p-4">
                    <h4 className="font-bold text-sm sm:text-base line-clamp-2 min-h-[2.5rem] text-gray-900">
            {producto.nombre}
          </h4>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl font-bold text-orange-500">
              {producto.precio}
            </span>
            {producto.antes && (
              <span className="text-sm line-through text-gray-400">
                {producto.antes}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">{producto.tienda}</p>
        </div>
      </div>
    </Link>
  );
}

function ProductSection({
  titulo,
  icono,
  items,
}: {
  titulo: string;
  icono: string;
  items: any[];
}) {
  if (!items.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
      <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
        {icono} {titulo}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {items.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  );
}

export default function Products({ productos }: Props) {
  const lista = Array.isArray(productos) ? productos : [];

  // Ofertas Flash: con etiqueta, o los 4 primeros
  const ofertasFlash = (
    lista.filter((p) => p.etiqueta) .length > 0
      ? lista.filter((p) => p.etiqueta)
      : lista
  ).slice(0, 4);

  // Mayor descuento
  const mayorDescuento = [...lista]
    .sort((a, b) => parseDescuento(b.descuento) - parseDescuento(a.descuento))
    .slice(0, 4);

  // Más populares (valoración o opiniones)
  const masPopulares = [...lista]
    .sort((a, b) => {
      const scoreA = (Number(a.valoracion) || 0) * 1000 + (Number(a.opiniones) || 0);
      const scoreB = (Number(b.valoracion) || 0) * 1000 + (Number(b.opiniones) || 0);
      return scoreB - scoreA;
    })
    .slice(0, 4);

  return (
    <div className="pt-4">
      <ProductSection titulo="Ofertas Flash" icono="🔥" items={ofertasFlash} />
      <ProductSection titulo="Mayor descuento" icono="📉" items={mayorDescuento} />
      <ProductSection titulo="Más populares" icono="⭐" items={masPopulares} />
    </div>
  );
}