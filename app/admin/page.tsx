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
import SyncAmazonButton from "../components/SyncAmazonButton";
import SyncAliExpressButton from "../components/SyncAliExpressButton";
import SyncCasaDelLibroButton from "../components/SyncCasaDelLibroButton";
import LimpiarOfertasButton from "../components/LimpiarOfertasButton";
import ImportAliExpressForm from "../components/ImportAliExpressForm";

type Props = {
  searchParams: Promise<{ tienda?: string; q?: string }>;
};

const TIENDAS = [
  { key: "", label: "Últimos 50" },
  { key: "amazon", label: "Amazon" },
  { key: "ebay", label: "eBay" },
  { key: "aliexpress", label: "AliExpress" },
  { key: "casadellibro", label: "Casa del Libro" },
] as const;

export default async function AdminPage({ searchParams }: Props) {
  const { userId } = await auth();

  const ADMIN_USER_ID = "user_3Hd21PlPrp9kabWnbxXrPCzlH0D";

  if (!userId || userId !== ADMIN_USER_ID) {
    redirect("/");
  }

  const params = await searchParams;
  const filtro = (params.tienda || "").toLowerCase().trim();
  const q = (params.q || "").trim();

  let productos: any[] = [];

  if (q) {
    const like = `%${q}%`;
    if (filtro === "amazon") {
      productos = (await sql`
        SELECT * FROM productos
        WHERE tienda ILIKE '%amazon%'
          AND nombre ILIKE ${like}
        ORDER BY id DESC
        LIMIT 50
      `) as any[];
    } else if (filtro === "ebay") {
      productos = (await sql`
        SELECT * FROM productos
        WHERE tienda ILIKE '%ebay%'
          AND nombre ILIKE ${like}
        ORDER BY id DESC
        LIMIT 50
      `) as any[];
    } else if (filtro === "aliexpress") {
      productos = (await sql`
        SELECT * FROM productos
        WHERE tienda ILIKE '%aliexpress%'
          AND nombre ILIKE ${like}
        ORDER BY id DESC
        LIMIT 50
      `) as any[];
    } else if (filtro === "casadellibro") {
      productos = (await sql`
        SELECT * FROM productos
        WHERE (tienda ILIKE '%casadellibro%' OR tienda ILIKE '%casa del libro%')
          AND nombre ILIKE ${like}
        ORDER BY id DESC
        LIMIT 50
      `) as any[];
    } else {
      productos = (await sql`
        SELECT * FROM productos
        WHERE nombre ILIKE ${like}
        ORDER BY id DESC
        LIMIT 50
      `) as any[];
    }
  } else if (filtro === "amazon") {
    productos = (await sql`
      SELECT * FROM productos
      WHERE tienda ILIKE '%amazon%'
      ORDER BY id DESC
      LIMIT 50
    `) as any[];
  } else if (filtro === "ebay") {
    productos = (await sql`
      SELECT * FROM productos
      WHERE tienda ILIKE '%ebay%'
      ORDER BY id DESC
      LIMIT 50
    `) as any[];
  } else if (filtro === "aliexpress") {
    productos = (await sql`
      SELECT * FROM productos
      WHERE tienda ILIKE '%aliexpress%'
      ORDER BY id DESC
      LIMIT 50
    `) as any[];
  } else if (filtro === "casadellibro") {
    productos = (await sql`
      SELECT * FROM productos
      WHERE tienda ILIKE '%casadellibro%' OR tienda ILIKE '%casa del libro%'
      ORDER BY id DESC
      LIMIT 50
    `) as any[];
  } else {
    productos = (await sql`
      SELECT * FROM productos
      ORDER BY id DESC
      LIMIT 50
    `) as any[];
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
        <div className="mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Panel de Administración
            </h1>
            <p className="mt-1 text-gray-400">
              Gestiona los productos de Oferthis
            </p>
          </div>

          <div className="flex flex-row flex-wrap items-center gap-3">
            <SyncEbayButton />
            <SyncAmazonButton />
            <SyncAliExpressButton />
            <SyncCasaDelLibroButton />
            <LimpiarOfertasButton />
            <Link
              href="/"
              className="text-sm text-gray-300 transition hover:text-orange-500"
            >
              ← Volver a la web
            </Link>
          </div>
        </div>

        <CreateProductForm />

        <ImportAliExpressForm />

        <div className="mb-4 flex flex-wrap gap-2">
          {TIENDAS.map((t) => {
            const href = t.key
              ? `/admin?tienda=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`
              : q
                ? `/admin?q=${encodeURIComponent(q)}`
                : "/admin";
            const activo =
              (t.key === "" && !filtro) || filtro === t.key;
            return (
              <Link
                key={t.key || "all"}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  activo
                    ? "bg-orange-500 text-white"
                    : "bg-white/10 text-gray-200 hover:bg-white/20"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        <form
          method="get"
          action="/admin"
          className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          {filtro ? (
            <input type="hidden" name="tienda" value={filtro} />
          ) : null}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre (ej: Joma Short)"
            className="flex-1 rounded-xl border border-white/20 bg-[#0c1222] px-4 py-2.5 text-sm text-white placeholder:text-gray-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
          >
            Buscar
          </button>
        </form>

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
          Mostrando {productos.length} productos
          {q ? ` · búsqueda: "${q}"` : ""}
          {filtro ? ` · ${filtro}` : " · últimos 50"}.
        </p>
      </main>
      <Footer />
    </>
  );
}