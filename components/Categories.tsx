"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

const promos = [
  {
    title: "Halloween",
    text: "Disfraces y decoración.",
    href: "/buscar?q=halloween",
    bg: "from-orange-600 to-purple-900",
    emoji: "🎃",
  },
  {
    title: "Moda otoño",
    text: "Sudaderas y botas.",
    href: "/buscar?q=sudadera",
    bg: "from-sky-600 to-slate-900",
    emoji: "🧥",
  },
  {
    title: "Tecnología",
    text: "Chollos del día.",
    href: "/buscar?q=tecnologia",
    bg: "from-amber-500 to-orange-900",
    emoji: "📱",
  },
  {
    title: "Libros",
    text: "Casa del Libro.",
    href: "/buscar?q=libros",
    bg: "from-rose-600 to-red-950",
    emoji: "📚",
  },
];

export default function Categories() {
  const [i, setI] = useState(0);

  const catIconHoverStyles = `
    .cat-icon-glow {
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, filter 0.2s ease;
    }
    .cat-icon-glow:hover {
      transform: scale(1.12);
      border-color: #ff7a1a;
      box-shadow:
        0 0 8px #ff6a00,
        0 0 18px #ff6a00,
        0 0 32px rgba(255, 106, 0, 0.85),
        inset 0 0 10px rgba(255, 140, 0, 0.35);
      filter: drop-shadow(0 0 8px #ff9a00);
    }
  `;

  useEffect(() => {
    const t = setInterval(() => {
      setI((p) => (p + 1) % promos.length);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const promo = promos[i];

  return (
    <section className="bg-[#070b16] px-4 py-4 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 lg:grid-cols-[260px_1fr_200px] lg:items-center">
        <div className="rounded-2xl border border-white/10 bg-[#0c1222] p-2">
          <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Categorías
          </p>
                    <style>{catIconHoverStyles}</style>
          <div className="grid grid-cols-4 gap-1">
            {cats.map((c) => (
              <Link
                key={c.name}
                href={`/buscar?q=${encodeURIComponent(c.q)}`}
                className="flex flex-col items-center gap-0.5 rounded-lg p-0.5 text-gray-300 hover:bg-white/5"
              >
                <span className="cat-icon-glow flex h-8 w-8 items-center justify-center rounded-full border-2 border-orange-500 text-sm">
                  {c.icon}
                </span>
                <span className="text-center text-[9px] leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="relative h-[148px] overflow-hidden rounded-2xl border border-white/10">
          <Link
            href={promo.href}
            className={`absolute inset-0 flex flex-col justify-center bg-gradient-to-br ${promo.bg} px-8 py-3`}
          >
            <span className="text-2xl">{promo.emoji}</span>
            <h3 className="mt-0.5 text-base font-black text-white md:text-lg">{promo.title}</h3>
            <p className="text-xs text-white/90">{promo.text}</p>
            <span className="mt-2 inline-flex w-fit rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-900">
              Ver ofertas →
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setI((p) => (p - 1 + promos.length) % promos.length)}
            className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-sm text-white"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setI((p) => (p + 1) % promos.length)}
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-sm text-white"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>

        <Link
          href="/buscar?q="
          aria-label="Ver ofertas"
          className="relative h-[148px] overflow-hidden rounded-2xl border border-white/10 bg-[#0c1222]"
        >
          <video
            src="/videos/principal.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-contain"
          />
        </Link>
      </div>
    </section>
  );
}