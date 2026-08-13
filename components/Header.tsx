"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
        <Link
          href="/"
          className="text-2xl sm:text-3xl font-extrabold whitespace-nowrap text-gray-900"
        >
          Ofer<span className="text-orange-500">this</span>
        </Link>

        <div className="flex-1 max-w-md hidden sm:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/favoritos"
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-bold transition text-xs sm:text-sm"
          >
            ❤️ <span className="hidden sm:inline">Favoritos</span>
          </Link>

          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg font-bold transition text-xs sm:text-sm">
                Entrar
              </button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </div>
      </div>

      <div className="hidden md:block border-t border-gray-100">
        <nav className="max-w-7xl mx-auto flex items-center gap-6 px-6 py-2 font-medium text-sm text-gray-800">
          <Link href="/" className="hover:text-orange-500 transition">
            Inicio
          </Link>
          <Link
            href="/categoria/tecnologia"
            className="hover:text-orange-500 transition"
          >
            Tecnología
          </Link>
          <Link
            href="/categoria/hogar"
            className="hover:text-orange-500 transition"
          >
            Hogar
          </Link>
          <Link
            href="/categoria/gaming"
            className="hover:text-orange-500 transition"
          >
            Gaming
          </Link>
          <Link
            href="/categoria/deporte"
            className="hover:text-orange-500 transition"
          >
            Deporte
          </Link>
        </nav>
      </div>

      <div className="sm:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  );
}