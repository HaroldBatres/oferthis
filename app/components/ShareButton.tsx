"use client";

export default function ShareButton() {
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: url,
        });
      } catch (error) {
        console.log("Error al compartir", error);
      }
    } else {
      // Si el navegador no soporta share, copiamos el enlace
      await navigator.clipboard.writeText(url);
      alert("¡Enlace copiado al portapapeles!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex-1 text-center border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3.5 rounded-xl text-lg font-bold transition"
    >
      Compartir
    </button>
  );
}