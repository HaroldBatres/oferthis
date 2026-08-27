"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export default function Header() {
  const { isSignedIn } = useAuth();
  const t = useTranslations("Header");

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-extrabold whitespace-nowrap"
          >
            Ofer<span className="text-orange-500">this</span>
          </Link>

          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            <Link
              href="/favoritos"
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-bold text-xs sm:text-sm"
            >
              ❤️
              <span className="hidden sm:inline"> {t("favorites")}</span>
            </Link>

            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg font-bold text-xs sm:text-sm">
                  {t("login")}
                </button>
              </SignInButton>
            ) : (
              <UserButton />
            )}
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center gap-6 font-medium text-sm mt-3">
          <Link href="/" className="hover:text-orange-500 transition">
            {t("home")}
          </Link>
          <Link
            href="/categoria/tecnologia"
            className="hover:text-orange-500 transition"
          >
            {t("technology")}
          </Link>
          <Link
            href="/categoria/hogar"
            className="hover:text-orange-500 transition"
          >
            {t("homeCategory")}
          </Link>
          <Link
            href="/categoria/gaming"
            className="hover:text-orange-500 transition"
          >
            {t("gaming")}
          </Link>
          <Link
            href="/categoria/deporte"
            className="hover:text-orange-500 transition"
          >
            {t("sport")}
          </Link>
        </nav>
      </div>
    </header>
  );
}