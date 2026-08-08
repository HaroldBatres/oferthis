export default function Benefits() {
  return (
    <section className="bg-white py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h3 className="text-4xl font-bold text-center mb-16">
          ¿Por qué usar Oferthis?
        </h3>

        <div className="grid md:grid-cols-3 gap-10">

          <div className="text-center">

            <div className="text-6xl">⚡</div>

            <h4 className="font-bold text-2xl mt-6">
              Actualización automática
            </h4>

            <p className="text-gray-500 mt-4">
              Los precios se actualizarán mediante la API de Amazon.
            </p>

          </div>

          <div className="text-center">

            <div className="text-6xl">💰</div>

            <h4 className="font-bold text-2xl mt-6">
              Solo ofertas reales
            </h4>

            <p className="text-gray-500 mt-4">
              Evitamos descuentos falsos y productos inflados.
            </p>

          </div>

          <div className="text-center">

            <div className="text-6xl">🚀</div>

            <h4 className="font-bold text-2xl mt-6">
              Rápido
            </h4>

            <p className="text-gray-500 mt-4">
              Diseño optimizado para móviles y escritorio.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}