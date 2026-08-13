export default function Hero() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 md:py-24 text-center">
        <h2
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight"
          style={{ color: "#111827" }}
        >
          Las mejores ofertas
          <br />
          <span style={{ color: "#f97316" }}>en un solo lugar</span>
        </h2>

        <p
          className="text-base sm:text-xl md:text-2xl mt-6 sm:mt-8 max-w-3xl mx-auto px-2"
          style={{ color: "#4b5563" }}
        >
          Encuentra descuentos reales de Amazon y otras tiendas.
          Productos actualizados automáticamente y organizados por categoría.
        </p>

        <a
          href="#ofertas"
          className="inline-block mt-8 sm:mt-12 bg-orange-500 hover:bg-orange-600 transition text-white px-8 sm:px-10 py-3.5 sm:py-5 rounded-xl text-lg sm:text-xl font-bold"
        >
          Ver ofertas
        </a>
      </div>
    </section>
  );
}