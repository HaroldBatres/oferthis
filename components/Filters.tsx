type Props = {
  busqueda: string;
  setBusqueda: (valor: string) => void;

  tiendaSeleccionada: string;
  setTiendaSeleccionada: (valor: string) => void;
};

export default function Filters({
  busqueda,
  setBusqueda,
  tiendaSeleccionada,
  setTiendaSeleccionada,
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-10">

      <div className="grid md:grid-cols-2 gap-6">

        <input
          type="text"
          placeholder="🔍 Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-4 border rounded-xl text-lg"
        />

        <select
          value={tiendaSeleccionada}
          onChange={(e) => setTiendaSeleccionada(e.target.value)}
          className="p-4 border rounded-xl text-lg"
        >
          <option>Todas</option>
          <option>Amazon</option>
          <option>eBay</option>
          <option>AliExpress</option>
          <option>SHEIN</option>
        </select>

      </div>

    </div>
  );
}