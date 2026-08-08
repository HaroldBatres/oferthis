import { MetadataRoute } from "next";
import { sql } from "./lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await sql`SELECT id FROM productos WHERE disponible = true` as any;

  const productosUrls = productos.map((p: any) => ({
    url: `https://tudominio.com/producto/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://tudominio.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://tudominio.com/categoria/tecnologia",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://tudominio.com/categoria/hogar",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://tudominio.com/categoria/gaming",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://tudominio.com/categoria/deporte",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productosUrls,
  ];
}