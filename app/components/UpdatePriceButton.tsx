"use client";

type Props = {
  productId: number;
  precioAnterior: string;
};

export default function UpdatePriceButton({ productId, precioAnterior }: Props) {
  const handleUpdate = async () => {
    const res = await fetch("/api/actualizar-precio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: productId,
        nuevoPrecio: "159,99€",
        precioAnterior: precioAnterior,
        descuento: "-48%",
      }),
    });

    const data = await res.json();
    alert(data.message || "Precio actualizado");
    window.location.reload();
  };

  return (
    <button
      onClick={handleUpdate}
      className="w-full mt-3 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold transition"
    >
      🔄 Actualizar precio (prueba)
    </button>
  );
}