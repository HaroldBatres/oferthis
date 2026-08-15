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

      // Recargar el panel para ver cambios
      window.location.reload();
    } catch {
      setMensaje("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
      >
        {loading ? "Sincronizando..." : "Sincronizar eBay"}
      </button>
      {mensaje && (
        <p className="text-xs text-gray-500 max-w-xs text-right">{mensaje}</p>
      )}
    </div>
  );
}