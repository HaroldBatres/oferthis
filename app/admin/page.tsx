import { sql } from "../lib/db";
import Link from "next/link";
import Footer from "../../components/Footer";
import DeleteProductButton from "../components/DeleteProductButton";
import CreateProductForm from "../components/CreateProductForm";
import CaducarProductButton from "../components/CaducarProductButton";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MarkUnavailableButton from "../components/MarkUnavailableButton";
import EditProductButton from "../components/EditProductButton";
import SyncEbayButton from "../components/SyncEbayButton";
import LimpiarOfertasButton from "../components/LimpiarOfertasButton";
import ImportAliExpressForm from "../components/ImportAliExpressForm";

export default async function AdminPage() {
  const { userId } = await auth();

  const ADMIN_USER_ID = "user_3Hd21PlPrp9kabWnbxXrPCzlH0D";

  if (!userId || userId !== ADMIN_USER_ID) {
    redirect("/");
  }

  const productos = (await sql`SELECT * FROM productos ORDER BY id`) as any;

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Panel de Administración
            </h1>
            <p className="mt-1 text-gray-400">
              Gestiona los productos de Oferthis
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <SyncEbayButton />
            <LimpiarOfertasButton />
            <Link
              href="/"
              className="text-center text-sm text-gray-300 transition hover:text-orange-500"
            >
              ← Volver a la web
            </Link>
          </div>
        </div>

        <CreateProductForm />

        <ImportAliExpressForm />

        <div className="rounded-2xl bg-white p-6 text-gray-900">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4 text-left font-medium text-gray-600">ID</th>
                <th className="p-4 text-left font-medium text-gray-600">
                  Producto
                </th>
                <th className="p-4 text-left font-medium text-gray-600">
                  Tienda
                </th>
                <th className="p-4 text-left font-medium text-gray-600">
                  Precio
                </th>
                <th className="p-4 text-left font-medium text-gray-600">
                  Descuento
                </th>
                <th className="p-4 text-left font-medium text-gray-600">
                  Estado
                </th>
                <th className="p-4 text-left font-medium text-gray-600">
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
                  <td className="p-4 font-medium text-gray-900">{p.nombre}</td>
                  <td className="p-4 text-gray-800">{p.tienda}</td>
                  <td className="p-4 font-semibold text-orange-500">
                    {p.precio}
                  </td>
                  <td className="p-4">
                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
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
                        className="text-sm text-orange-500 hover:underline"
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

        <p className="mt-6 text-sm text-gray-400">
          Total de productos: {productos.length}
        </p>
      </main>
      <Footer />
    </>
  );
}