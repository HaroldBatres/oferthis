import Link from "next/link";

const cats = [
  { name: "Tecnología", icon: "💻", q: "tecnologia" },
  { name: "Hogar", icon: "🏠", q: "hogar" },
  { name: "Gaming", icon: "🎮", q: "gaming" },
  { name: "Deporte", icon: "🏋️", q: "deporte" },
  { name: "Cocina", icon: "🍲", q: "cocina" },
  { name: "Moda", icon: "👗", q: "moda" },
  { name: "Belleza", icon: "💄", q: "belleza" },
  { name: "Mascotas", icon: "🐾", q: "mascotas" },
];

export default function Categories() {
  return (
    <section className="bg-[#070b16] px-4 py-6 md:px-8">
      <style>{`
        .cat-icon {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, filter 0.2s ease;
        }
        .cat-icon:hover {
          transform: scale(1.12);
          border-color: #ff7a1a;
          box-shadow:
            0 0 8px #ff6a00,
            0 0 18px #ff6a00,
            0 0 32px rgba(255, 106, 0, 0.85),
            inset 0 0 10px rgba(255, 140, 0, 0.35);
          filter: drop-shadow(0 0 8px #ff9a00);
        }
        .cat-link:hover span:last-child {
          color: #ff9a3c;
          text-shadow: 0 0 8px rgba(255, 106, 0, 0.8);
        }
      `}</style>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-white/10 bg-[#0c1222] px-3 py-4">
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {cats.map((c) => (
              <Link
                key={c.name}
                href={`/buscar?q=${encodeURIComponent(c.q)}`}
                className="cat-link flex flex-col items-center gap-2 text-gray-300"
              >
                <span className="cat-icon flex h-14 w-14 items-center justify-center rounded-full border-2 border-orange-500 text-2xl">
                  {c.icon}
                </span>
                <span className="text-[11px]">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/buscar?q="
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0c1222] px-5 py-4 lg:w-72"
        >
          <div>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-lg font-black text-white">
              %
            </div>
            <p className="text-sm font-semibold text-white">
              Las mejores ofertas de tus tiendas favoritas
            </p>
            <p className="mt-2 text-[11px] text-gray-400">
              amazon · ebay · AliExpress
            </p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}