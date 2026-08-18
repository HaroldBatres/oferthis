"use client";

import { useState } from "react";

export default function LimpiarOfertasButton() {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function handleClick() {
    const ok = window.confirm(
      "¿Marcar como no disponibles las ofertas inválidas o caducadas (URL genérica, sin /itm/, picsum, etc.)?"
    );
    if (!ok) return;

    setCargando(true);
    setMensaje("");

    try {
      const res = await fetch("/api/limpiar-ofertas", { method: "POST" });
      const data = await res.json();

      if (!data.ok) {
        setMensaje(data.error || "Error al limpiar");
        setCargando(false);
        return;
      }

      setMensaje(`Listo: ${data.marcados} producto(s) marcados como no disponibles.`);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e: any) {
      setMensaje(e?.message || "Error de red");
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={cargando}
        className="bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
      >
        {cargando ? "Limpiando..." : "Limpiar ofertas inválidas"}
      </button>
      {mensaje && (
        <p className="text-sm text-gray-600">{mensaje}</p>
      )}
    </div>
  );
}