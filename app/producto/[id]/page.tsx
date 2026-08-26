import Link from "next/link";
import Image from "next/image";
import ShareButton from "../../components/ShareButton";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { sql } from "../../lib/db";
import PriceAlertButton from "../../components/PriceAlertButton";
import VoteButtons from "../../components/VoteButtons";
import Comments from "../../components/Comments";
import ProductImageGallery from "../../components/ProductImageGallery";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const resultado = (await sql`
    SELECT * FROM productos WHERE id = ${Number(id)}
  `) as any;
  const producto = resultado[0];
  if (!producto) return { title: "Producto no encontrado | Oferthis" };
  return {
    title: `${producto.nombre} | Oferthis`,
    description: `Oferta de ${producto.nombre} en ${producto.tienda}. Precio: ${producto.precio}`,
  };
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const resultado = (await sql`
    SELECT * FROM productos WHERE id = ${Number(id)}
  `) as any;
  const producto = resultado[0];
  const t = await getTranslations("Product");

  if (!producto) {
    return (
      <>
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
          <h1 className="text-3xl font-bold text-gray-900">{t("notFound")}</h1>
        </main>
        <Footer />
      </>
    );
  }

  const titulo = String(producto.nombre ?? "Producto sin nombre");
  const descripcion = producto.descripcion
    ? String(producto.descripcion)
    : "";
  const caracteristicas = producto.caracteristicas
    ? String(producto.caracteristicas)
    : "";

  const precioActual =
    parseFloat(
      String(producto.precio || "0").replace("€", "").replace(",", ".")
    ) || 0;
  const precioAnterior =
    parseFloat(
      String(producto.antes || "0").replace("€", "").replace(",", ".")
    ) || 0;
  const ahorro =
    precioAnterior > precioActual ? precioAnterior - precioActual : 0;
  const porcentajeAhorro =
    precioAnterior > 0 ? Math.round((ahorro / precioAnterior) * 100) : 0;

  const relacionados = (await sql`
    SELECT * FROM productos
    WHERE categoria = ${producto.categoria}
      AND id != ${producto.id}
      AND (disponible = true OR disponible IS NULL)
    LIMIT 4
  `) as any[];

  let listaImagenes: string[] = [];
  if (Array.isArray(producto.imagenes)) {
    listaImagenes = producto.imagenes;
  } else if (typeof producto.imagenes === "string") {
    try {
      const p = JSON.parse(producto.imagenes);
      if (Array.isArray(p)) listaImagenes = p;
    } catch {
      /* ignore */
    }
  }
  if (listaImagenes.length === 0 && producto.imagen) {
    listaImagenes = [producto.imagen];
  }

  const lineasDescripcion = descripcion
    ? descripcion
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16 bg-white text-gray-900">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
        >
          <span className="text-lg">←</span>
          {t("back")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.4fr_1fr] gap-6 lg:gap-8 items-start">
          <div className="order-2 lg:order-1 min-w-0">
            {caracteristicas ? (
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  {t("features")}
                </h2>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {caracteristicas}
                </div>
              </section>
            ) : (
              <p className="text-sm text-gray-400">{t("noFeatures")}</p>
            )}
          </div>

          <div className="order-1 lg:order-2 min-w-0">
            <ProductImageGallery imagenes={listaImagenes} alt={titulo} />
          </div>

          <div className="order-3 min-w-0">
            {producto.descuento ? (
              <span className="inline-block bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
                {producto.descuento}
              </span>
            ) : null}

            <p className="mt-3 text-sm text-gray-500">
              {t("ref", { id: producto.id })}
            </p>

            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
              {titulo}
            </h1>

            <p className="mt-4 text-lg text-gray-800">
              {t("soldBy")}{" "}
              <span className="font-bold text-orange-500">{producto.tienda}</span>
            </p>

            {producto.categoria ? (
              <span className="mt-3 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                📂 {producto.categoria}
              </span>
            ) : null}

            {producto.disponible !== false ? (
              <p className="mt-3 font-semibold text-green-600">
                ✅ {t("available")}
              </p>
            ) : (
              <p className="mt-3 font-semibold text-red-600">
                ❌ {t("soldOut")}
              </p>
            )}

            <div className="mt-6 p-5 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-orange-500">
                  {producto.precio}
                </span>
                {producto.antes ? (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {producto.antes}
                  </span>
                ) : null}
              </div>
              {ahorro > 0 ? (
                <p className="mt-2 text-green-600 font-semibold">
                  {t("youSave", {
                    amount: ahorro.toFixed(2).replace(".", ","),
                    percent: porcentajeAhorro,
                  })}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {producto.url ? (
                <a
                  href={producto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl text-lg font-bold transition shadow-sm"
                >
                  {t("buyOn", { tienda: producto.tienda })}
                </a>
              ) : null}
              <ShareButton />
            </div>

            <div className="mt-4 space-y-3">
              <PriceAlertButton
                productId={producto.id}
                precioActual={producto.precio}
              />
              <VoteButtons productId={producto.id} />
            </div>
          </div>
        </div>

        {lineasDescripcion.length > 0 ? (
          <div className="mt-12 max-w-3xl mx-auto px-4 sm:px-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                {t("description")}
              </h2>
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                {lineasDescripcion.map((linea, i) => {
                  if (linea.startsWith("### ")) {
                    return (
                      <h3
                        key={i}
                        className="text-base font-bold text-gray-900 mt-6 mb-2"
                      >
                        {linea.replace(/^###\s*/, "")}
                      </h3>
                    );
                  }
                  if (linea.startsWith("- ")) {
                    return (
                      <p key={i} className="pl-1">
                        {linea}
                      </p>
                    );
                  }
                  return <p key={i}>{linea}</p>;
                })}
              </div>
            </section>
          </div>
        ) : null}

        {relacionados.length > 0 ? (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("related")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {relacionados.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/producto/${item.id}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    width={300}
                    height={300}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">
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
        ) : null}

        <Comments productoId={producto.id} />
      </main>
      <Footer />
    </>
  );
}