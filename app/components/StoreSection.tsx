import Link from "next/link";
import ProductCard from "./ProductCard";

function colorTienda(title: string, href: string) {
  const s = `${title} ${href}`.toLowerCase();
  if (s.includes("ebay")) return "#2f6bff";
  if (s.includes("ali")) return "#e62e04";
  if (s.includes("casa")) return "#9b1b1e";
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
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .tienda-franja::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.28) 50%, transparent 70%);
          transform: translateX(-120%);
          pointer-events: none;
        }
        .tienda-franja:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
        }
        .tienda-franja:hover::after {
          animation: franja-brillo 0.7s ease;
        }
        @keyframes franja-brillo {
          from { transform: translateX(-120%); }
          to { transform: translateX(120%); }
        }
        .tienda-grid > * {
          transition: transform 0.25s ease;
        }
        .tienda-grid > *:hover {
          transform: scale(1.06);
          z-index: 8;
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <div
          className="tienda-franja mb-5 flex items-center justify-between gap-4 rounded-2xl px-6 py-5"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}, 0 0 28px ${color}99`,
          }}
        >
          <div className="relative z-10">
            <p className="text-sm font-semibold tracking-wide text-white/90 md:text-base">
              Selección de chollos
            </p>
            <h2
              className="text-3xl font-black tracking-tight text-white md:text-4xl"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,.35)" }}
            >
              {title}
            </h2>
          </div>

          <Link
            href={href}
            className="relative z-10 shrink-0 rounded-full bg-white px-6 py-3 text-base font-black text-gray-900 hover:bg-white md:text-lg"
          >
            Ver todas →
          </Link>
        </div>

        <div className="tienda-grid grid grid-cols-2 gap-4 md:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id ?? p.nombre ?? i} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}