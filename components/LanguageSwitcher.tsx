"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeLocale(nextLocale: string) {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        type="button"
        disabled={isPending}
        onClick={() => changeLocale("es")}
        className="px-2 py-1 rounded hover:bg-gray-100"
      >
        ES
      </button>
      <span className="text-gray-300">|</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => changeLocale("en")}
        className="px-2 py-1 rounded hover:bg-gray-100"
      >
        EN
      </button>
    </div>
  );
}