"use client";

import { useState } from "react";

export default function SyncCasaDelLibroButton() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  return (
    <div>
      <style>{`
        .btn-casa {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .btn-casa:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow:
            0 0 10px #9b1b1e,
            0 0 22px rgba(155, 27, 30, 0.7);
        }
      `}</style>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          void (async () => {
            setLoading(true);
            setMensaje("");
            try {
              const res = await fetch("/api/importar-awin");
              const data = await res.json();
              setMensaje(
                data.ok
                  ? `Libros: ${data.actualizados ?? 0} act.`
                  : data.error || "Error libros"
              );
            } catch {
              setMensaje("Error libros");
            }
            setLoading(false);
          })();
        }}
        className="btn-casa rounded-xl bg-[#9b1b1e] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? "Libros..." : "Actualizar Casa del Libro"}
      </button>
      {mensaje ? <p className="mt-1 text-xs text-white">{mensaje}</p> : null}
    </div>
  );
}