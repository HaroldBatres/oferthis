import { sql } from "../lib/db";

export default async function Home() {
  const productos = await sql`SELECT * FROM productos` as any;

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Prueba de Neon</h1>
      <p className="mb-4">Productos encontrados: {productos.length}</p>

      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(productos, null, 2)}
      </pre>
    </main>
  );
}