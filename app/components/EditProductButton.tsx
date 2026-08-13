"use client";

import { useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  tienda: string;
  precio: string;
  antes: string;
  descuento: string;
  categoria: string;
  imagen: string;
  url: string | null;
  etiqueta: string | null;
};

type Props = {
  producto: Producto;
};

export default function EditProductButton({ producto }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre: producto.nombre || "",
    tienda: producto.tienda || "",
    precio: producto.precio || "",
    antes: producto.antes || "",
    descuento: producto.descuento || "",
    categoria: producto.categoria || "",
    imagen: producto.imagen || "",
    url: producto.url || "",
    etiqueta: producto.etiqueta || "",
  });

  function actualizarCampo(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);

    try {
      const res = await fetch("/api/actualizar-producto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: producto.id, ...form }),
      });

      if (!res.ok) {
        alert("Error al guardar");
        setGuardando(false);
        return;
      }

      setAbierto(false);
      window.location.reload();
    } catch {
      alert("Error de red");
      setGuardando(false);
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-sm text-blue-600 hover:underline ml-2"
      >
        Editar
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4">Editar producto #{producto.id}</h3>

        <form onSubmit={handleGuardar} className="space-y-3">
          {(
            [
              ["nombre", "Nombre"],
              ["tienda", "Tienda"],
              ["precio", "Precio"],
              ["antes", "Precio anterior"],
              ["descuento", "Descuento"],
              ["categoria", "Categoría"],
              ["imagen", "URL imagen"],
              ["url", "URL afiliado (Comprar)"],
              ["etiqueta", "Etiqueta"],
            ] as const
          ).map(([campo, label]) => (
            <div key={campo}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={form[campo]}
                onChange={(e) => actualizarCampo(campo, e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="px-4 py-2.5 border rounded-xl text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}