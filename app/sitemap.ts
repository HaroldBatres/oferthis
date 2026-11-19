import type { MetadataRoute } from "next";
import { sql } from "./lib/db";
import { cached } from "./lib/cache";

// Se genera al pedirlo (no en el build, que no tiene acceso a la base de datos)
// y se cachea 1 hora.
export const dynamic = "force-dynamic";

const getIdsProductos = cached(
  async () =>
    (await sql`
      SELECT id FROM productos
      WHERE disponible = true OR disponible IS NULL
    `) as any[],
  "sitemap-ids",
  3600,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.oferthis.com";

  const productos = await getIdsProductos();

  const categorias = [
    "tecnologia",
    "hogar",
    "gaming",
    "deporte",
    "cocina",
    "moda",
    "belleza",
    "mascotas",
  ];

  // Solo tiendas con página propia que ya aparecen en la navegación.
  const tiendas = ["amazon", "ebay", "aliexpress", "mibro"];

  const legales = ["aviso-legal", "privacidad", "cookies", "afiliados"];

  const productosUrls = productos.map((p: any) => ({
    url: `${baseUrl}/producto/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoriasUrls = categorias.map((slug) => ({
    url: `${baseUrl}/categoria/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const tiendasUrls = tiendas.map((slug) => ({
    url: `${baseUrl}/tienda/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const legalesUrls = legales.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.2,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...tiendasUrls,
    ...categoriasUrls,
    ...productosUrls,
    ...legalesUrls,
  ];
}
