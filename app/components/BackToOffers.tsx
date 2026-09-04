"use client";

import { useRouter } from "next/navigation";

export default function BackToOffers() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
    >
      <span className="text-lg">←</span>
      Volver a las ofertas
    </button>
  );
}