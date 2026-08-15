import { sql } from "../lib/db";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DeleteProductButton from "../components/DeleteProductButton";
import CreateProductForm from "../components/CreateProductForm";
import CaducarProductButton from "../components/CaducarProductButton";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MarkUnavailableButton from "../components/MarkUnavailableButton";
import EditProductButton from "../components/EditProductButton";
import SyncEbayButton from "../components/SyncEbayButton";

export default async function AdminPage() {
  const { userId } = await auth();

  const ADMIN_USER_ID = "user_3Hd21PlPrp9kabWnbxXrPCzlH0D";

  if (!userId || userId !== ADMIN_USER_ID) {
    redirect("/");
  }

      const productos = await sql`SELECT * FROM productos` as any;

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
  <div>
    <h1 className="text-3xl md:text-4xl font-bold">Panel de Administración</h1>
    <p className="text-gray-500 mt-1">
      Gestiona los productos de Oferthis
    </p>
  </div>

  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <SyncEbayButton />
    <Link
      href="/"
      className="text-sm text-center text-gray-600 hover:text-orange-500 transition"
    >
      ← Volver a la web
    </Link>
  </div>
</div>

        <CreateProductForm />

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">ID</th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Producto
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Tienda
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Precio
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Descuento
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Estado
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p: any) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="p-4 text-gray-500">{p.id}</td>
                  <td className="p-4 font-medium">{p.nombre}</td>
                  <td className="p-4">{p.tienda}</td>
                  <td className="p-4 text-orange-500 font-semibold">
                    {p.precio}
                  </td>
                  <td className="p-4">
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                      {p.descuento}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.disponible === false ? (
                      <span className="text-xs font-medium text-gray-400">
                        Caducado
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-green-600">
                        Activo
                      </span>
                    )}
                  </td>
                  <td className="p-4">
  <div className="flex flex-wrap items-center gap-3">
    <Link
      href={`/producto/${p.id}`}
      className="text-orange-500 hover:underline text-sm"
    >
      Ver
    </Link>
    <EditProductButton producto={p} />
    <DeleteProductButton
      productId={p.id}
      productName={p.nombre}
    />
    <MarkUnavailableButton
      productId={p.id}
      productName={p.nombre}
    />
    {p.disponible !== false && (
      <CaducarProductButton
        productId={p.id}
        productName={p.nombre}
      />
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Total de productos: {productos.length}
        </p>
      </main>
      <Footer />
    </>
  );
}