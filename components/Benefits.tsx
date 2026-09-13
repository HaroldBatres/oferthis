export default function Benefits() {
  return (
    <section className="border-t border-white/10 bg-[#070b16] px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-extrabold text-white">
            <span className="text-orange-500">%F</span> Oferthis
          </p>
          <p className="text-xs text-gray-400">
            Las mejores ofertas, en un solo lugar.
          </p>
        </div>

        <div className="h-32 w-full overflow-hidden rounded-xl border border-white/10 md:w-56">
          <video
            src="/videos/principal.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
            aria-label="Vídeo promocional de Oferthis"
          />
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-300">
          <p>🛡️ Ofertas reales y verificadas</p>
          <p>⚡ Las mejores tiendas en un solo lugar</p>
          <p>🚚 Enlaces seguros y confiables</p>
        </div>

        <p className="rounded-md bg-orange-500 px-4 py-2 text-sm font-extrabold italic text-white">
          ¡Ahorra más!
        </p>
      </div>
    </section>
  );
}