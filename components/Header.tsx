"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useLocale } from "next-intl";
import { setUserLocale } from "@/i18n/setLocale";

export default function Header() {
  const locale = useLocale();

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

        <nav className="hidden items-center gap-6 text-sm text-gray-300 md:flex">
          <Link href="/" className="hover:text-white">
            Inicio
          </Link>
          <Link href="/tienda/amazon" className="hover:text-white">
            Amazon
          </Link>
          <Link href="/tienda/ebay" className="hover:text-white">
            eBay
          </Link>
          <Link href="/tienda/aliexpress" className="hover:text-white">
            AliExpress
          </Link>
        </nav>

        <div className="flex items-center gap-3">
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
    </header>
  );
}