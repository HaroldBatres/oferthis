"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

type Props = {
  productId: number;
  precioActual: string;
};

export default function PriceAlertButton({ productId, precioActual }: Props) {
  const { isSignedIn } = useAuth();
  const [mostrar, setMostrar] = useState(false);
  const [precioObjetivo, setPrecioObjetivo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      alert("Debes iniciar sesión para crear una alerta");
      return;
    }

    const res = await fetch("/api/alertas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        precioObjetivo,
      }),
    });

    if (res.ok) {
      setMensaje("¡Alerta creada! Te avisaremos cuando baje de precio.");
      setMostrar(false);
      setPrecioObjetivo("");
    } else {
      setMensaje("Error al crear la alerta");
    }
  };

  return (
    <div className="mt-4">
      {!mostrar ? (
        <button
          onClick={() => setMostrar(true)}
          className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold transition"
        >
          🔔 Crear alerta de precio
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl border">
          <p className="text-sm text-gray-600 mb-3">
            Precio actual: <strong>{precioActual}</strong>
          </p>
          <label className="block text-sm font-medium mb-1">
            Avisarme cuando baje a:
          </label>
          <input
            type="text"
            value={precioObjetivo}
            onChange={(e) => setPrecioObjetivo(e.target.value)}
            placeholder="Ej: 149,99€"
            className="w-full border rounded-lg p-3 mb-3"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold"
            >
              Guardar alerta
            </button>
            <button
              type="button"
              onClick={() => setMostrar(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {mensaje && (
        <p className="mt-3 text-sm text-green-600 font-medium">{mensaje}</p>
      )}
    </div>
  );
}