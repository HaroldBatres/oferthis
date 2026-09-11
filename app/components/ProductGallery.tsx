"use client";

import { useState } from "react";

type Props = {
  nombre: string;
  imagen: string;
  imagenes?: string | string[] | null;
};

export default function ProductGallery({ nombre, imagen, imagenes }: Props) {
  const extra = Array.isArray(imagenes)
    ? imagenes
    : String(imagenes || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const fotos = [imagen, ...extra].filter(Boolean);
  const unicas = [...new Set(fotos)];
  const [activa, setActiva] = useState(unicas[0] || imagen);

  return (
    <div>
      <div className="bg-white rounded-2xl border overflow-hidden flex items-center justify-center p-4 min-h-[280px]">
        <img
          src={activa}
          alt={nombre}
          className="max-w-full max-h-[420px] w-auto h-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {unicas.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {unicas.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiva(src)}
              className={`shrink-0 w-16 h-16 rounded-lg border overflow-hidden bg-white ${
                activa === src ? "border-orange-500 ring-2 ring-orange-300" : "border-gray-200"
              }`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}