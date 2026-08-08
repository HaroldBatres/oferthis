"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { SignInButton, UserButton, Show } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-4">

        {/* Logo */}
        <Link href="/" className="text-3xl font-extrabold whitespace-nowrap">
          Ofer<span className="text-orange-500">this</span>
        </Link>

        {/* Buscador */}
        <SearchBar />

        {/* Menú */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link href="/" className="hover:text-orange-500 transition">
            Inicio
          </Link>
          <Link href="/categoria/tecnologia" className="hover:text-orange-500 transition">
            Tecnología
          </Link>
          <Link href="/categoria/hogar" className="hover:text-orange-500 transition">
            Hogar
          </Link>
          <Link href="/categoria/gaming" className="hover:text-orange-500 transition">
            Gaming
          </Link>
          <Link href="/categoria/deporte" className="hover:text-orange-500 transition">
            Deporte
          </Link>

          <Link
            href="/favoritos"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm"
          >
            ❤️ Favoritos
          </Link>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm border-3 border-black">
  Entrar
</button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>

      </div>
    </header>
  );
}