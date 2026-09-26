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
  const [fallo, setFallo] = useState(false);
  const actual = fotos[activa] || fotos[0];

  if (!actual || fallo) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-100">
        <span className="text-sm text-gray-400">Imagen no disponible</span>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border bg-white">
        <img
          src={actual}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => {
            if (activa < fotos.length - 1) setActiva(activa + 1);
            else setFallo(true);
          }}
          className="h-auto max-h-[520px] w-full bg-white object-contain"
        />
      </div>
      {fotos.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {fotos.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActiva(i)}
              className={`overflow-hidden rounded-lg border ${
                i === activa ? "border-orange-500" : "border-gray-200"
              }`}
            >
              <img
                src={url}
                alt=""
                referrerPolicy="no-referrer"
                className="h-16 w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}