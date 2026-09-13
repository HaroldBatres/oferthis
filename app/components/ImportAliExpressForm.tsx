"use client";

import { useState } from "react";

export default function ImportAliExpressForm() {
  const [keywords, setKeywords] = useState("auriculares");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    const res = await fetch("/api/importar-aliexpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setMensaje(`Importados: ${data.insertados} productos`);
      window.location.reload();
    } else {
      setMensaje(data.error || "Error al importar");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-gray-900"
    >
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        Importar de AliExpress
      </h2>
      <p className="mb-4 text-sm text-gray-700">
        Una búsqueda concreta, o el catálogo (10 búsquedas, como eBay).
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="flex-1 rounded-xl border-2 border-gray-800 bg-white px-4 py-3 font-medium text-black placeholder:text-gray-500"
          placeholder="Ej: auriculares"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Importando..." : "Importar búsqueda"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setMensaje("");
            const res = await fetch("/api/importar-aliexpress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ catalogo: true }),
            });
            const data = await res.json();
            setLoading(false);
            if (data.success) {
              setMensaje(`Catálogo importado: ${data.insertados} productos`);
              window.location.reload();
            } else {
              setMensaje(data.error || "Error al importar");
            }
          }}
          className="rounded-xl bg-gray-900 px-6 py-3 font-bold text-white hover:bg-black disabled:opacity-50"
        >
          Importar catálogo
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setMensaje("Actualizando fotos...");
            const res = await fetch("/api/actualizar-fotos-aliexpress", {
              method: "POST",
            });
            const data = await res.json();
            setLoading(false);
            setMensaje(
              data.success
                ? `Fotos actualizadas: ${data.actualizados}`
                : data.error || "Error"
            );
          }}
          className="rounded-xl border-2 border-gray-900 bg-white px-6 py-3 font-bold text-gray-900 hover:bg-gray-100 disabled:opacity-50"
        >
          Actualizar fotos existentes
        </button>
      </div>
      {mensaje && (
        <p className="mt-3 text-sm font-medium text-gray-900">{mensaje}</p>
      )}
    </form>
  );
} 