"use client";

import { useState } from "react";

export default function CreateProductForm() {
  const [nombre, setNombre] = useState("");
  const [tienda, setTienda] = useState("Amazon");
  const [precio, setPrecio] = useState("");
  const [antes, setAntes] = useState("");
  const [descuento, setDescuento] = useState("");
  const [categoria, setCategoria] = useState("Tecnología");
  const [imagen, setImagen] = useState("");
    const [url, setUrl] = useState("");
  const [caducaEn, setCaducaEn] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    const res = await fetch("/api/crear-producto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
        nombre,
        tienda,
        precio,
        antes,
        descuento,
        categoria,
        imagen,
        url,
        caducaEn: caducaEn || null,
      }),
    });

    const data = await res.json();
    setCargando(false);

    if (data.success) {
      alert("Producto creado correctamente");
      window.location.reload();
    } else {
      alert(data.error || "Error al crear el producto");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 mb-10">
      <h2 className="text-xl font-bold mb-6">Añadir nuevo producto</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded-xl p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tienda</label>
          <select
            value={tienda}
            onChange={(e) => setTienda(e.target.value)}
            className="w-full border rounded-xl p-3"
          >
            <option>Amazon</option>
            <option>eBay</option>
            <option>AliExpress</option>
            <option>SHEIN</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Precio actual</label>
          <input
            type="text"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="179,99€"
            className="w-full border rounded-xl p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Precio anterior</label>
          <input
            type="text"
            value={antes}
            onChange={(e) => setAntes(e.target.value)}
            placeholder="309,99€"
            className="w-full border rounded-xl p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descuento</label>
          <input
            type="text"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
            placeholder="-42%"
            className="w-full border rounded-xl p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border rounded-xl p-3"
          >
            <option>Tecnología</option>
            <option>Hogar</option>
            <option>Gaming</option>
            <option>Deporte</option>
            <option>Cocina</option>
            <option>Moda</option>
          </select>
        </div>

                <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">URL del producto (opcional)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://amazon.es/..."
            className="w-full border rounded-xl p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Caduca el (opcional)
          </label>
          <input
            type="date"
            value={caducaEn}
            onChange={(e) => setCaducaEn(e.target.value)}
            className="w-full border rounded-xl p-3"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}