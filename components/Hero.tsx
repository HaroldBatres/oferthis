export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#070b16]">
      <img
        src="/hero-oferthis.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-right"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b16] via-[#070b16]/85 to-[#070b16]/20" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="max-w-xl">
          <p className="mb-4 inline-flex rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
            OFERTAS · CHOLLOS · DESCUENTOS
          </p>

          <h1 className="text-4xl font-extrabold leading-[1.05] text-white md:text-5xl">
            Las <span className="text-orange-500">mejores ofertas</span>,
            <br />
            en un solo lugar.
          </h1>

          <p className="mt-4 max-w-md text-sm text-gray-300">
            Encuentra los mayores descuentos en Amazon, eBay, AliExpress
            y muchas más tiendas.
          </p>

          <form action="/buscar" method="get" className="mt-6 flex max-w-lg overflow-hidden rounded-full bg-white shadow-lg">
            <input
              name="q"
              placeholder="¿Qué estás buscando?"
              className="min-w-0 flex-1 px-5 py-3 text-sm text-gray-900 outline-none"
            />
            <button
              type="submit"
              className="m-1 rounded-full bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600"
            >
              Buscar →
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white">
              <span>🛡️</span> Ofertas verificadas
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white">
              <span>⚡</span> Actualizamos a diario
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white">
              <span>🚚</span> Te redirigimos a la tienda
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}