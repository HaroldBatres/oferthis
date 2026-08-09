"use client";

type Props = {
  productId: number;
  productName: string;
};

export default function CaducarProductButton({ productId, productName }: Props) {
  const handleCaducar = async () => {
    const confirmar = window.confirm(
      `¿Caducar "${productName}"?\nDejará de mostrarse en la web.`
    );
    if (!confirmar) return;

    try {
      const res = await fetch("/api/caducar-producto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });

      if (!res.ok) {
        alert("Error al caducar el producto");
        return;
      }

      window.location.reload();
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <button
      onClick={handleCaducar}
      className="text-amber-600 hover:text-amber-700 text-sm font-medium"
    >
      Caducar
    </button>
  );
}