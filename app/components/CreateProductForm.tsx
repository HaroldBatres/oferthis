"use client";

import { useState } from "react";

const campo =
  "w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500 outline-none focus:border-orange-500";

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
      className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm"
    >
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Añadir nuevo producto
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={campo}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Tienda
          </label>
          <select
            value={tienda}
            onChange={(e) => setTienda(e.target.value)}
            className={campo}
          >
            <option>Amazon</option>
            <option>eBay</option>
            <option>AliExpress</option>
            <option>SHEIN</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Precio actual
          </label>
          <input
            type="text"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="179,99€"
            className={campo}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Precio anterior
          </label>
          <input
            type="text"
            value={antes}
            onChange={(e) => setAntes(e.target.value)}
            placeholder="309,99€"
            className={campo}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Descuento
          </label>
          <input
            type="text"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
            placeholder="-42%"
            className={campo}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Categoría
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={campo}
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
          <label className="mb-1 block text-sm font-medium text-gray-800">
            URL de la imagen
          </label>
          <input
            type="text"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="https://picsum.photos/400/400?5"
            className={campo}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-800">
            URL del producto (opcional)
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://amazon.es/..."
            className={campo}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Caduca el (opcional)
          </label>
          <input
            type="date"
            value={caducaEn}
            onChange={(e) => setCaducaEn(e.target.value)}
            className={campo}
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