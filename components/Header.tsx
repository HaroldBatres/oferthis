"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useLocale } from "next-intl";
import { setUserLocale } from "@/i18n/setLocale";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/tienda/amazon", label: "Amazon" },
  { href: "/tienda/ebay", label: "eBay" },
  { href: "/tienda/aliexpress", label: "AliExpress" },
  { href: "/buscar?q=libros", label: "Casa del Libro" },
];

function linkClass(pathname: string, href: string) {
  const activo =
    href === "/"
      ? pathname === "/"
      : href.startsWith("/buscar")
        ? pathname.startsWith("/buscar")
        : pathname.startsWith(href);
  return activo
    ? "text-orange-400 font-semibold"
    : "text-gray-300 hover:text-white";
}

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  async function cambiarIdioma(next: "es" | "en") {
    await setUserLocale(next);
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b16]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src="/logo-oferthis.png"
            alt="Oferthis"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(pathname, l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md px-2 py-1 text-white md:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-label="Menú"
          >
            ☰
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <button
              type="button"
              onClick={() => cambiarIdioma("es")}
              className={locale === "es" ? "text-orange-400" : "hover:text-orange-400"}
            >
              ES
            </button>
            <span className="text-white/40">|</span>
            <button
              type="button"
              onClick={() => cambiarIdioma("en")}
              className={locale === "en" ? "text-orange-400" : "hover:text-orange-400"}
            >
              EN
            </button>
          </div>

          <Link
            href="/favoritos"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
          >
            ♥ Favoritos
          </Link>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-full bg-[#0b1220] px-4 py-2 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-black">
                Entrar
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>

      {abierto && (
        <nav className="space-y-2 border-t border-white/10 px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-1 text-sm ${linkClass(pathname, l.href)}`}
              onClick={() => setAbierto(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}