export default function Hero() {
  return (
             <section className="border-b border-orange-300 bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-gray-900">
          🔥 Las mejores ofertas
        </h2>

        <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
          Descuentos de Amazon, eBay, AliExpress y más, en un solo lugar.
        </p>

        {/* Buscador gigante */}
        <form
          action="/buscar"
          method="get"
          className="mt-8 sm:mt-10 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl shadow-sm focus-within:border-orange-400 transition p-2">
            <input
              type="search"
              name="q"
              placeholder="Buscar ofertas... (ej: monitor, airpods, silla gamer)"
              className="flex-1 px-4 py-3 sm:py-4 text-base sm:text-lg outline-none rounded-xl"
              required
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 sm:px-8 py-3 sm:py-4 rounded-xl transition shrink-0"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}