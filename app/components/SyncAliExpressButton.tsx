"use client";

import { useState } from "react";

export default function SyncAliExpressButton() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  return (
    <div>
      <style>{`
        .btn-ali {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .btn-ali:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow:
            0 0 10px #e62e04,
            0 0 22px rgba(230, 46, 4, 0.7);
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
              const res = await fetch("/api/importar-aliexpress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ catalogo: true }),
              });
              const data = await res.json();
              setMensaje(
                data.ok || data.success
                  ? `Ali: ${data.insertados ?? 0} nuevos`
                  : data.error || "Error Ali"
              );
            } catch {
              setMensaje("Error Ali");
            }
            setLoading(false);
          })();
        }}
        className="btn-ali rounded-xl bg-[#e62e04] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? "AliExpress..." : "Actualizar AliExpress"}
      </button>
      {mensaje ? <p className="mt-1 text-xs text-white">{mensaje}</p> : null}
    </div>
  );
}