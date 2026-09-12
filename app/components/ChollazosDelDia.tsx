import ProductCard from "./ProductCard";
import Link from "next/link";

export default function ChollazosDelDia({ products }: { products: any[] }) {
    const list = (products || []).slice(0, 10);
  if (!list.length) return null;

  return (
    <section className="bg-[#070b16] px-4 py-8 md:px-8">
      <style>{`
        @keyframes llama-arder {
          0%, 100% {
            transform: scale(1) rotate(-4deg) translateY(0);
            filter: drop-shadow(0 0 4px #ff6a00) drop-shadow(0 0 12px #ff4500);
          }
          25% {
            transform: scale(1.18) rotate(5deg) translateY(-2px);
            filter: drop-shadow(0 0 8px #ffb000) drop-shadow(0 0 18px #ff6a00);
          }
          50% {
            transform: scale(1.06) rotate(-3deg) translateY(-1px);
            filter: drop-shadow(0 0 14px #ff4500) drop-shadow(0 0 22px #ff9a00);
          }
          75% {
            transform: scale(1.22) rotate(4deg) translateY(-3px);
            filter: drop-shadow(0 0 10px #ffcc00) drop-shadow(0 0 20px #ff6a00);
          }
        }
        .llama-arder {
          display: inline-block;
          transform-origin: bottom center;
          animation: llama-arder 0.7s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-white">
              <span className="llama-arder text-3xl">🔥</span>
              Chollazos del día
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Los productos más buscados, al mejor precio.
            </p>
          </div>
          <Link
            href="/buscar?q="
            className="text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            Ver todos los chollos →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {list.map((p, i) => (
            <ProductCard key={p.id ?? p.nombre ?? i} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}