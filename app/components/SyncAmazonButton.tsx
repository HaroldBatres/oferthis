"use client";

import { useState } from "react";

export default function SyncAmazonButton() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  return (
    <div>
      <style>{`
        .btn-amazon {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .btn-amazon:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow:
            0 0 10px #ff9900,
            0 0 22px rgba(255, 153, 0, 0.7);
        }
      `}</style>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          void (async () => {
            setLoading(true);
            setMensaje("Llamando...");
            try {
              const res = await fetch("/api/actualizar-amazon", { method: "POST" });
              const texto = await res.text();
              setMensaje(`HTTP ${res.status}: ${texto.slice(0, 220)}`);
            } catch (e: any) {
              setMensaje(e?.message || "Error de red");
            }
            setLoading(false);
          })();
        }}
        className="btn-amazon rounded-xl bg-[#ff9900] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
      >
        {loading ? "Amazon..." : "Actualizar Amazon"}
      </button>
      {mensaje ? (
        <p className="mt-1 max-w-md text-xs text-white">{mensaje}</p>
      ) : null}
    </div>
  );
}