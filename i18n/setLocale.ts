"use server";

import { cookies } from "next/headers";

export async function setUserLocale(locale: "es" | "en") {
  const store = await cookies();
  store.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}