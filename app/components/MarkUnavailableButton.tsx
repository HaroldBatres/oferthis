"use client";

type Props = {
  productId: number;
  productName: string;
};

export default function MarkUnavailableButton({ productId, productName }: Props) {
  const handleMark = async () => {
    const confirmar = confirm(
      `¿Marcar "${productName}" como oferta caducada?`
    );

    if (!confirmar) return;

    const res = await fetch("/api/actualizar-precio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: productId,
        nuevoPrecio: "Caducado",
        precioAnterior: "Caducado",
        descuento: "0%",
      }),
    });

    // Mejor: crear una API específica, pero por ahora usamos una actualización simple
    const res2 = await fetch("/api/marcar-caducado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId }),
    });

    const data = await res2.json();

    if (data.success) {
      alert("Producto marcado como caducado");
      window.location.reload();
    } else {
      alert("Error al marcar el producto");
    }
  };

  return (
    <button
      onClick={handleMark}
      className="text-yellow-600 hover:underline text-sm ml-3"
    >
      Caducar
    </button>
  );
}