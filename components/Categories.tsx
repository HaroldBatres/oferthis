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
  { name: "Bricolaje", icon: "🛠️", q: "herramientas" },
  { name: "Coche", icon: "🚗", q: "automocion" },
  { name: "Libros", icon: "📚", q: "libros" },
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
            <div className="grid grid-cols-6 gap-3">
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
          aria-label="Ver ofertas"
          className="group relative flex min-h-40 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c1222] lg:w-72"
        >
          <video
            src="/videos/principal.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
              className="absolute inset-0 h-full w-full object-contain transition duration-500 group-hover:scale-105"
          />
        </Link>
      </div>
    </section>
  );
}