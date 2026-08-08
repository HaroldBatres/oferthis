export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-gray-100 to-white">

      <div className="max-w-7xl mx-auto px-6 py-24 text-center">

        <h2 className="text-7xl font-black leading-tight">

          Las mejores ofertas
          <br />

          <span className="text-orange-500">
            en un solo lugar
          </span>

        </h2>

        <p className="text-2xl text-gray-600 mt-8 max-w-4xl mx-auto">

          Encuentra descuentos reales de Amazon y otras tiendas.
          Productos actualizados automáticamente y organizados por categoría.

        </p>

        <button className="mt-12 bg-orange-500 hover:bg-orange-600 transition text-white px-10 py-5 rounded-xl text-xl font-bold">

          Ver ofertas

        </button>

      </div>

    </section>
  );
}