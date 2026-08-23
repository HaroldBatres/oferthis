import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import FavoriteButton from "./FavoriteButton";
import DiscountBadge from "./DiscountBadge";

type Producto = {
  id: number;
  nombre: string;
  precio: string;
  antes?: string;
  descuento?: string;
  imagen: string;
  tienda: string;
  categoria?: string;
};

type Props = {
  tienda: string;
  productos: Producto[];
  color?: string;
  maxPorCategoria?: number;
  plano?: boolean;
};

function ProductCard({ p }: { p: Producto }) {
  return (
    <Link
      href={`/producto/${p.id}`}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="relative">
        <Image
          src={p.imagen}
          alt={p.nombre}
          width={200}
          height={200}
          unoptimized
          className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
        />
        <DiscountBadge descuento={p.descuento || ""} />
        <div className="absolute top-2 right-2">
          <FavoriteButton productId={p.id} />
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-orange-500">
          {p.nombre}
        </h4>
        <p className="text-orange-500 font-bold text-sm mt-1">{p.precio}</p>
        {p.antes && p.antes !== p.precio && (
          <p className="text-gray-400 text-xs line-through">{p.antes}</p>
        )}
      </div>
    </Link>
  );
}

export default async function StoreSection({
  tienda,
  productos,
  color = "orange",
  maxPorCategoria = 7,
  plano = false,
}: Props) {
  const t = await getTranslations("Home");

  if (!productos || productos.length === 0) return null;

  const franja =
    color === "blue"
      ? "bg-gradient-to-r from-blue-600 to-blue-500"
      : color === "red"
        ? "bg-gradient-to-r from-red-600 to-orange-500"
        : "bg-gradient-to-r from-orange-500 to-amber-400";

  const cabecera = (
    <div
      className={`rounded-2xl px-6 py-5 mb-8 flex items-center justify-between ${franja}`}
    >
      <div>
        <p className="text-white/80 text-sm font-medium mb-0.5">
          {t("dealsSelection")}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {t("storeDeals", { tienda })}
        </h2>
      </div>
      <Link
        href={`/tienda/${tienda.toLowerCase()}`}
        className="text-sm font-semibold bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
      >
        {t("seeAll")} →
      </Link>
    </div>
  );

  if (plano) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {cabecera}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {productos.slice(0, 10).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    );
  }

  const porCategoria: Record<string, Producto[]> = {};
  for (const p of productos) {
    const cat = p.categoria || "Otros";
    if (!porCategoria[cat]) porCategoria[cat] = [];
    porCategoria[cat].push(p);
  }
  const categorias = Object.keys(porCategoria).sort();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {cabecera}
      <div className="space-y-10">
        {categorias.map((cat) => (
          <div key={cat}>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">
              {cat}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {porCategoria[cat].slice(0, maxPorCategoria).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}