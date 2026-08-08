import Link from "next/link";
import Image from "next/image";
import { sql } from "../../lib/db";
import type { Producto } from "../../models/product";
import FavoriteButton from "../../components/FavoriteButton";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const categoriaNombre = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Ofertas de ${categoriaNombre} | Oferthis`,
    description: `Descubre las mejores ofertas de ${categoriaNombre} en Amazon, eBay, AliExpress y más. Ahorra con Oferthis.`,
  };
}

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    tienda?: string;
    orden?: string;
    page?: string;
  }>;
};

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tienda, orden, page } = await searchParams;

  const categoriaNombre = slug.charAt(0).toUpperCase() + slug.slice(1);

 const todosLosProductos = await sql`SELECT * FROM productos WHERE disponible = true` as any;

let productosFiltrados = todosLosProductos
  .filter((p: any) =>
    p.categoria
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") ===
    slug
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  )
  .filter((p: any) => {
    if (!tienda) return true;
    return p.tienda.toLowerCase() === tienda.toLowerCase();
  });

// Ordenación
if (orden === "precio") {
  productosFiltrados = productosFiltrados.sort((a: any, b: any) => {
    const precioA = parseFloat(a.precio.replace("€", "").replace(",", "."));
    const precioB = parseFloat(b.precio.replace("€", "").replace(",", "."));
    return precioA - precioB;
  });
}

if (orden === "descuento") {
  productosFiltrados = productosFiltrados.sort((a: any, b: any) => {
    const descA = parseInt(a.descuento.replace("%", "").replace("-", ""));
    const descB = parseInt(b.descuento.replace("%", "").replace("-", ""));
    return descB - descA;
  });
}

// Paginación
const productosPorPagina = 8;
const paginaActual = page ? parseInt(page) : 1;
const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

const productosPaginados = productosFiltrados.slice(
  (paginaActual - 1) * productosPorPagina,
  paginaActual * productosPorPagina
);

  return (
  <>
    <Header />
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      {/* Botón volver */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
      >
        <span className="text-lg">←</span>
        Volver a las ofertas
      </Link>

      {/* Título */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {categoriaNombre}
        </h1>
        <p className="text-gray-500">
          {productosFiltrados.length}{" "}
          {productosFiltrados.length === 1
            ? "oferta encontrada"
            : "ofertas encontradas"}
        </p>
      </div>

      {/* Filtro por tienda */}
      <div className="mb-8 flex flex-wrap gap-3">
        <span className="text-sm font-medium text-gray-600 self-center">
          Filtrar por tienda:
        </span>

        <Link
          href={`/categoria/${slug}`}
          className={`px-4 py-1.5 rounded-full text-sm border transition ${
            !tienda
              ? "bg-orange-500 text-white border-orange-500"
              : "border-gray-200 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          Todas
        </Link>

        <Link
          href={`/categoria/${slug}?tienda=Amazon`}
          className={`px-4 py-1.5 rounded-full text-sm border transition ${
            tienda === "Amazon"
              ? "bg-orange-500 text-white border-orange-500"
              : "border-gray-200 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          Amazon
        </Link>

        <Link
          href={`/categoria/${slug}?tienda=eBay`}
          className={`px-4 py-1.5 rounded-full text-sm border transition ${
            tienda === "eBay"
              ? "bg-orange-500 text-white border-orange-500"
              : "border-gray-200 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          eBay
        </Link>

        <Link
          href={`/categoria/${slug}?tienda=AliExpress`}
          className={`px-4 py-1.5 rounded-full text-sm border transition ${
            tienda === "AliExpress"
              ? "bg-orange-500 text-white border-orange-500"
              : "border-gray-200 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          AliExpress
        </Link>

        <Link
          href={`/categoria/${slug}?tienda=SHEIN`}
          className={`px-4 py-1.5 rounded-full text-sm border transition ${
            tienda === "SHEIN"
              ? "bg-orange-500 text-white border-orange-500"
              : "border-gray-200 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          SHEIN
        </Link>
      </div>

      {/* Ordenación */}
      <div className="mb-8 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">
          Ordenar por:
        </span>

        <Link
          href={`/categoria/${slug}${tienda ? `?tienda=${tienda}&orden=descuento` : "?orden=descuento"}`}
          className="px-4 py-1.5 rounded-full text-sm border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition"
        >
          Mayor descuento
        </Link>

        <Link
          href={`/categoria/${slug}${tienda ? `?tienda=${tienda}&orden=precio` : "?orden=precio"}`}
          className="px-4 py-1.5 rounded-full text-sm border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition"
        >
          Menor precio
        </Link>
      </div>

      {/* Grid de productos */}
      {productosPaginados.length === 0 ? (
        <p className="text-gray-500">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosPaginados.map((item: Producto) => (
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

                <div className="absolute top-3 right-3">
                  <FavoriteButton productId={item.id} />
                </div>
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

            {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="mt-12 flex justify-center items-center gap-3">
          {paginaActual > 1 && (
            <Link
              href={`/categoria/${slug}?${tienda ? `tienda=${tienda}&` : ""}${orden ? `orden=${orden}&` : ""}page=${paginaActual - 1}`}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition text-sm"
            >
              ← Anterior
            </Link>
          )}

          <span className="text-sm text-gray-600">
            Página {paginaActual} de {totalPaginas}
          </span>

          {paginaActual < totalPaginas && (
            <Link
              href={`/categoria/${slug}?${tienda ? `tienda=${tienda}&` : ""}${orden ? `orden=${orden}&` : ""}page=${paginaActual + 1}`}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition text-sm"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </main>
    <Footer />
  </>
  );
}