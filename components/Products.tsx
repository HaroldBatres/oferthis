"use client";

import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "../app/components/FavoriteButton";

type Props = {
  productos: any[];
};

export default function Products({ productos }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-4xl font-bold">Ofertas destacadas</h3>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {productos.map((producto) => (
          <Link key={producto.id} href={`/producto/${producto.id}`}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="relative bg-gray-200 h-64 flex items-center justify-center">
                <div className="absolute top-3 right-3 z-10">
                  <FavoriteButton productId={producto.id} />
                </div>

                <Image
                  src={producto.imagen}
                  alt={producto.nombre}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <span className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                  {producto.descuento}
                </span>

                <h4 className="font-bold text-xl mt-5">{producto.nombre}</h4>

                <div className="mt-6">
                  <span className="text-3xl font-bold text-orange-500">
                    {producto.precio}
                  </span>
                  <span className="ml-3 line-through text-gray-400">
                    {producto.antes}
                  </span>
                </div>

                <button className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold">
                  Ver en {producto.tienda}
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}