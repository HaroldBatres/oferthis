"use client";

type Props = {
  productId: number;
  productName: string;
};

export default function MarkUnavailableButton({ productId, productName }: Props) {
  const handleClick = async () => {
    if (!confirm(`¿Marcar "${productName}" como no disponible?`)) return;

    const res = await fetch("/api/marcar-no-disponible", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Error al marcar el producto");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-sm text-red-600 hover:underline ml-3"
    >
      No disponible
    </button>
  );
}