import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";
import DiscountBadge from "./DiscountBadge";
import { getTranslations } from "next-intl/server";

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
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <Image
          src={p.imagen}
          alt={p.nombre}
          width={200}
          height={200}
          unoptimized
          className="h-40 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <DiscountBadge descuento={p.descuento || ""} />

        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton productId={p.id} />
        </div>
      </div>

      <div className="p-3">
        <h4 className="line-clamp-2 text-xs font-semibold text-black transition-colors duration-200 group-hover:text-orange-500">
          {p.nombre}
        </h4>

        <p className="mt-1 text-sm font-bold text-orange-500">{p.precio}</p>

        {p.antes && p.antes !== p.precio && (
          <p className="text-xs text-gray-500 line-through">{p.antes}</p>
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

  const lista = productos.filter(
    (p, i, arr) =>
      arr.findIndex((x) => x.nombre === p.nombre && x.tienda === p.tienda) === i
  );

  const franja =
    color === "blue"
      ? "bg-gradient-to-r from-blue-600 to-blue-500"
      : color === "red"
        ? "bg-gradient-to-r from-red-600 to-orange-500"
        : "bg-gradient-to-r from-orange-500 to-amber-400";

  const cabecera = (
    <div
      className={`mb-8 flex items-center justify-between rounded-2xl px-6 py-5 ${franja}`}
    >
      <div>
        <p className="mb-0.5 text-sm font-medium text-white/80">
          {t("dealsSelection")}
        </p>
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          {t("storeDeals", { tienda })}
        </h2>
      </div>

      <Link
        href={`/tienda/${tienda.toLowerCase()}`}
        className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
      >
        {t("seeAll")} →
      </Link>
    </div>
  );

  if (plano) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {cabecera}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {lista.slice(0, 8).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    );
  }

  const porCategoria: Record<string, Producto[]> = {};
  for (const p of lista) {
    const cat = p.categoria || "Otros";
    if (!porCategoria[cat]) porCategoria[cat] = [];
    porCategoria[cat].push(p);
  }

  const categorias = Object.keys(porCategoria).sort();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {cabecera}
      <div className="space-y-10">
        {categorias.map((cat) => (
          <div key={cat}>
            <h3 className="mb-4 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-700">
              {cat}
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
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