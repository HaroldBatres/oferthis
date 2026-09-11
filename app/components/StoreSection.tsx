import Link from "next/link";
import ProductCard from "./ProductCard";

function colorTienda(title: string, href: string) {
  const s = `${title} ${href}`.toLowerCase();
  if (s.includes("ebay")) return "#2f6bff";
  if (s.includes("ali")) return "#e62e04";
  if (s.includes("amazon")) return "#ff9900";
  if (s.includes("shein")) return "#7b2cbf";
  return "#f97316";
}

export default function StoreSection({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: any[];
}) {
  const list = (products || []).slice(0, 8);
  if (!list.length) return null;

  const color = colorTienda(title, href);

  return (
    <section className="bg-[#070b16] px-4 py-8 md:px-8">
      <style>{`
        .tienda-franja {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .tienda-franja:hover {
          transform: translateY(-1px);
          box-shadow:
            0 0 10px #ff6a00,
            0 0 22px rgba(255, 106, 0, 0.75),
            0 0 40px rgba(255, 106, 0, 0.45);
          filter: brightness(1.08);
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <div
          className="tienda-franja mb-5 flex items-center justify-between gap-4 rounded-2xl px-6 py-4"
          style={{ backgroundColor: color }}
        >
          <div>
            <p className="text-sm font-medium text-white/80">Selección de chollos</p>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">{title}</h2>
          </div>

          <Link
            href={href}
            className="shrink-0 rounded-full bg-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/30 md:text-base"
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id ?? p.nombre ?? i} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}