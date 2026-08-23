import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { sql } from "../lib/db";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FavoriteButton from "../components/FavoriteButton";

export default async function FavoritosPage() {
  const { userId } = await auth();
  const t = await getTranslations("Favorites");
  const tCommon = await getTranslations("Common");

  if (!userId) {
    redirect("/");
  }

  const favoritosIds = (await sql`
    SELECT product_id FROM favoritos WHERE user_id = ${userId}
  `) as any;

  const ids = favoritosIds.map((f: any) => f.product_id);

  let productos: any[] = [];

  if (ids.length > 0) {
    productos = (await sql`
      SELECT * FROM productos 
      WHERE id = ANY(${ids}) AND disponible = true
    `) as any;
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
          >
            <span className="text-lg">←</span>
            {tCommon("backToOffers")}
          </Link>

          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-gray-500 mt-1">
            {productos.length}{" "}
            {productos.length === 1 ? t("product") : t("products")}
          </p>
        </div>

        {productos.length === 0 ? (
          <p className="text-gray-500">{t("empty")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((item: any) => (
              <Link
                key={item.id}
                href={`/producto/${item.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded">
                    {item.descuento}
                  </span>
                  <div className="absolute top-3 right-3">
                    <FavoriteButton productId={item.id} />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-orange-500 transition">
                    {item.nombre}
                  </h3>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-orange-500 font-bold text-lg">
                      {item.precio}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {item.antes}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}