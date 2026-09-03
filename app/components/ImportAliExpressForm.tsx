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
      className="mb-8 bg-orange-50 border border-orange-100 rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold mb-2">Importar de AliExpress</h2>
      <p className="text-sm text-gray-600 mb-4">
        Una búsqueda concreta, o el catálogo (10 búsquedas, como eBay).
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="flex-1 border rounded-xl px-4 py-3"
          placeholder="Ej: auriculares"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
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
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
        >
          Importar catálogo
        </button>
      </div>
      {mensaje && <p className="mt-3 text-sm font-medium">{mensaje}</p>}
    </form>
  );
}