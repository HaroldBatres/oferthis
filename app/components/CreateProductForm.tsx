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
    <form
      onSubmit={handleSubmit}
      className="mb-10 rounded-2xl border bg-white p-6 text-gray-900 shadow-sm"
    >
      <h2 className="mb-6 text-xl font-bold text-gray-900">Añadir nuevo producto</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-xl border p-3 text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tienda</label>
          <select
            value={tienda}
            onChange={(e) => setTienda(e.target.value)}
            className="w-full rounded-xl border p-3 text-gray-900"
          >
            <option>Amazon</option>
            <option>eBay</option>
            <option>AliExpress</option>
            <option>CasaDelLibro</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Precio</label>
          <input
            type="text"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="19,99€"
            className="w-full rounded-xl border p-3 text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Precio anterior</label>
          <input
            type="text"
            value={antes}
            onChange={(e) => setAntes(e.target.value)}
            placeholder="29,99€"
            className="w-full rounded-xl border p-3 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Descuento</label>
          <input
            type="text"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
            placeholder="-33%"
            className="w-full rounded-xl border p-3 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-xl border p-3 text-gray-900"
          >
            <option>Tecnología</option>
            <option>Hogar</option>
            <option>Gaming</option>
            <option>Deporte</option>
            <option>Cocina</option>
            <option>Moda</option>
            <option>Belleza</option>
            <option>Mascotas</option>
            <option>Bricolaje</option>
            <option>Coche</option>
            <option>Libros</option>
            <option>Bebidas y Alimentación</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">URL de la imagen</label>
          <input
            type="text"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border p-3 text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            URL del producto (opcional)
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://amazon.es/..."
            className="w-full rounded-xl border p-3 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Caduca el (opcional)
          </label>
          <input
            type="date"
            value={caducaEn}
            onChange={(e) => setCaducaEn(e.target.value)}
            className="w-full rounded-xl border p-3 text-gray-900"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="mt-6 rounded-xl bg-orange-500 px-8 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}