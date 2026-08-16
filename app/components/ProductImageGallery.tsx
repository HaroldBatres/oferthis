"use client";

import { useState } from "react";

type Props = {
  imagenes: string[];
  alt: string;
};

export default function ProductImageGallery({ imagenes, alt }: Props) {
  const lista =
    imagenes && imagenes.length > 0
      ? imagenes
      : ["https://picsum.photos/400/400"];

  const [activa, setActiva] = useState(0);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border">
      <div className="relative">
        <img
          src={lista[activa]}
          alt={alt}
          className="w-full h-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {lista.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto border-t bg-gray-50">
          {lista.map((url, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiva(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                index === activa
                  ? "border-orange-500"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={url}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}