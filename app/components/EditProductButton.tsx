"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="ml-2 text-sm text-blue-600 hover:underline"
      >
        Editar
      </button>

      {mounted &&
        abierto &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
              <h3 className="mb-4 text-xl font-bold">
                Editar producto #{producto.id}
              </h3>

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
                    <label className="mb-1 block text-sm font-medium text-gray-600">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={form[campo]}
                      onChange={(e) => actualizarCampo(campo, e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm text-black"
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 rounded-xl bg-orange-500 py-2.5 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {guardando ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    className="rounded-xl border px-4 py-2.5 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}