import Link from "next/link";
import Image from "next/image";
import type { Producto } from "../../models/product";
import ShareButton from "../../components/ShareButton";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { sql } from "../../lib/db";
import UpdatePriceButton from "../../components/UpdatePriceButton";
import PriceAlertButton from "../../components/PriceAlertButton";
import VoteButtons from "../../components/VoteButtons";
import Comments from "../../components/Comments";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const resultado = (await sql`SELECT * FROM productos WHERE id = ${Number(id)}`) as any;
  const producto = resultado[0];

  if (!producto) {
    return {
      title: "Producto no encontrado | Oferthis",
    };
  }

  return {
    title: `${producto.nombre} - ${producto.descuento} | Oferthis`,
    description: `Oferta de ${producto.nombre} en ${producto.tienda}. Precio: ${producto.precio} (antes ${producto.antes}).`,
  };
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;

  const resultado = (await sql`SELECT * FROM productos WHERE id = ${Number(id)}`) as any;
  const producto = resultado[0];

  if (!producto) {
    return (
      <>
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
          <h1 className="text-4xl font-bold">Producto no encontrado</h1>
          <p className="mt-4">ID buscado: {id}</p>
        </main>
        <Footer />
      </>
    );
  }

  const precioActual = parseFloat(
    producto.precio.replace("€", "").replace(",", ".")
  );
  const precioAnterior = parseFloat(
    producto.antes.replace("€", "").replace(",", ".")
  );
  const ahorro = precioAnterior - precioActual;
  const porcentajeAhorro = Math.round((ahorro / precioAnterior) * 100);

  // Productos relacionados
  const relacionados = (await sql`
    SELECT * FROM productos
    WHERE categoria = ${producto.categoria}
      AND id != ${producto.id}
      AND (disponible = true OR disponible IS NULL)
    LIMIT 4
  `) as any[];

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
        >
          <span className="text-lg">←</span>
          Volver a las ofertas
        </Link>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14">
          {/* Imagen */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border">
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              width={600}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Información */}
          <div>
            <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
              {producto.descuento}
            </span>

            {producto.etiqueta && (
              <p className="mt-4 inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-sm">
                {producto.etiqueta}
              </p>
            )}

            <p className="mt-6 text-gray-500 text-sm">
              Referencia #{producto.id}
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2 leading-tight">
              {producto.nombre}
            </h1>

            {producto.valoracion && (
              <p className="mt-4 text-yellow-500 text-lg font-semibold">
                ⭐ {producto.valoracion} ({producto.opiniones} opiniones)
              </p>
            )}

            <div className="mt-5 space-y-2.5">
              <p className="text-lg">
                Vendido por{" "}
                <span className="font-bold text-orange-500">
                  {producto.tienda}
                </span>
              </p>

              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                📂 {producto.categoria}
              </span>

              {producto.entrega && (
                <p className="text-green-600 font-medium">
                  🚚 {producto.entrega}
                </p>
              )}

              {producto.disponible !== undefined && (
                <p
                  className={`font-semibold ${
                    producto.disponible ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {producto.disponible ? "✅ Disponible" : "❌ Agotado"}
                </p>
              )}
            </div>

            {/* Precios */}
            <div className="mt-8 p-5 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-orange-500">
                  {producto.precio}
                </span>
                <span className="text-lg text-gray-400 line-through mb-1">
                  {producto.antes}
                </span>
              </div>
              <p className="mt-2 text-green-600 font-semibold">
                Ahorras {ahorro.toFixed(2).replace(".", ",")} € (
                {porcentajeAhorro}%)
              </p>
            </div>

            {/* Botones */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {producto.url && (
                <a
                  href={producto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl text-lg font-bold transition shadow-sm"
                >
                  Comprar en {producto.tienda}
                </a>
              )}
              <ShareButton />
            </div>

            <div className="mt-4 space-y-3">
              <UpdatePriceButton
                productId={producto.id}
                precioAnterior={producto.antes}
              />
              <PriceAlertButton
                productId={producto.id}
                precioActual={producto.precio}
              />
              <VoteButtons productId={producto.id} />
            </div>

            {/* Historial de precios */}
            {producto.historial_precios &&
              producto.historial_precios.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>📈</span> Historial de precios
                  </h2>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-600">
                            Fecha
                          </th>
                          <th className="text-left p-4 font-medium text-gray-600">
                            Precio
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {producto.historial_precios.map(
                          (
                            item: { fecha: string; precio: string },
                            index: number
                          ) => (
                            <tr
                              key={index}
                              className="border-t border-gray-100 hover:bg-gray-50"
                            >
                              <td className="p-4 text-gray-700">
                                {item.fecha}
                              </td>
                              <td className="p-4 font-semibold text-orange-500">
                                {item.precio}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Productos relacionados */}
        {relacionados.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {relacionados.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/producto/${item.id}`}
                  className="bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    width={300}
                    height={300}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {item.nombre}
                    </h3>
                    <p className="text-orange-500 font-bold mt-2">
                      {item.precio}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comentarios */}
        <Comments productoId={producto.id} />
      </main>
      <Footer />
    </>
  );
}