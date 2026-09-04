"use client";

import { useMemo, useState } from "react";

type Props = {
  imagenes: unknown;
  alt: string;
};

function normalizar(imagenes: unknown): string[] {
  if (!imagenes) return [];
  if (Array.isArray(imagenes)) {
    return imagenes.filter((x) => typeof x === "string" && x.startsWith("http"));
  }
  if (typeof imagenes === "string") {
    try {
      const p = JSON.parse(imagenes);
      return normalizar(p);
    } catch {
      return imagenes.startsWith("http") ? [imagenes] : [];
    }
  }
  if (typeof imagenes === "object" && imagenes !== null) {
    const o = imagenes as any;
    if (Array.isArray(o.string)) return normalizar(o.string);
    return Object.values(o).flatMap((v) => normalizar(v));
  }
  return [];
}

export default function ProductImageGallery({ imagenes, alt }: Props) {
  const fotos = useMemo(() => {
    const n = normalizar(imagenes);
    return Array.from(new Set(n));
  }, [imagenes]);

  const [activa, setActiva] = useState(0);
  const actual = fotos[activa] || fotos[0];

  if (!actual) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-2xl" />
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <img
          src={actual}
          alt={alt}
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[520px] object-contain bg-white"
        />
      </div>
      {fotos.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {fotos.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActiva(i)}
              className={`border rounded-lg overflow-hidden ${
                i === activa ? "border-orange-500" : "border-gray-200"
              }`}
            >
              <img
                src={url}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-16 object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}