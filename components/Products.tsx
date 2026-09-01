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
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />

          {producto.descuento && (
            <span className="absolute top-3 left-3 z-10 flex flex-col items-center justify-center min-w-[72px] rounded-xl bg-gradient-to-br from-red-600 to-orange-500 px-3 py-2 text-white shadow-lg ring-2 ring-white/40">
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-95">
                Descuento
              </span>
              <span className="text-lg font-black leading-none mt-0.5">
                {producto.descuento}
              </span>
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
          <ProductCard key={`${titulo}-${producto.id}`} producto={producto} />
        ))}
      </div>
    </section>
  );
}

export default function Products({ productos }: Props) {
  const lista = Array.isArray(productos) ? productos : [];

  const destacados = lista.slice(0, 30);

  const ofertasFlash = (
    lista.filter((p) => p.etiqueta).length > 0
      ? lista.filter((p) => p.etiqueta)
      : lista
  ).slice(0, 4);

  const mayorDescuento = [...lista]
    .sort((a, b) => parseDescuento(b.descuento) - parseDescuento(a.descuento))
    .slice(0, 4);

  return (
    <div className="pt-4">
      <ProductSection
        titulo="Ofertas destacadas"
        icono="🛒"
        items={destacados}
      />
      <ProductSection titulo="Ofertas Flash" icono="🔥" items={ofertasFlash} />
      <ProductSection
        titulo="Mayor descuento"
        icono="📉"
        items={mayorDescuento}
      />
    </div>
  );
}