"use client";

type Props = {
  productId: number;
  productName: string;
};

export default function DeleteProductButton({ productId, productName }: Props) {
  const handleDelete = async () => {
    const confirmar = confirm(`¿Seguro que quieres eliminar "${productName}"?`);

    if (!confirmar) return;

    const res = await fetch("/api/eliminar-producto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Producto eliminado");
      window.location.reload();
    } else {
      alert("Error al eliminar el producto");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:underline text-sm ml-3"
    >
      Eliminar
    </button>
  );
}