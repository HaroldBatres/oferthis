"use client";

import { useState } from "react";

export default function SyncEbayButton() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function handleSync() {
    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch("/api/sincronizar-ebay");
      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.error || "Error al sincronizar");
        return;
      }

      setMensaje(
        `OK: ${data.actualizados} actualizados, ${data.insertados} nuevos, ${data.marcados_no_disponibles} caducados`
      );

      window.location.reload();
    } catch {
      setMensaje("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <style>{`
        .btn-ebay {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .btn-ebay:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow:
            0 0 10px #2563eb,
            0 0 22px rgba(37, 99, 235, 0.7);
        }
      `}</style>
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="btn-ebay rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? "Sincronizando..." : "Sincronizar eBay"}
      </button>
      {mensaje ? <p className="mt-1 text-xs text-white">{mensaje}</p> : null}
    </div>
  );
}