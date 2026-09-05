"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "oferthis-cookies";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const elegir = (valor: "accepted" | "rejected") => {
    localStorage.setItem(STORAGE_KEY, valor);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-xl rounded-2xl p-4 sm:p-6">
        <p className="text-sm sm:text-base text-gray-900 mb-4">
          Usamos cookies necesarias para que la web funcione (inicio de
          sesión y seguridad). No usamos cookies de publicidad propia.
          Puedes aceptar o rechazar las no esenciales. Más información en la{" "}
          <Link href="/cookies" className="text-orange-600 font-semibold underline">
            política de cookies
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="text-orange-600 font-semibold underline">
            política de privacidad
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => elegir("accepted")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl"
          >
            Aceptar
          </button>
          <button
            onClick={() => elegir("rejected")}
            className="border-2 border-gray-900 text-gray-900 font-bold px-5 py-3 rounded-xl"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}