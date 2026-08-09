import type { MetadataRoute } from "next";
import { sql } from "./lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://oferthis.com"; // más adelante tu dominio real

  const productos = (await sql`
    SELECT id FROM productos
    WHERE disponible = true OR disponible IS NULL
  `) as any[];

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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...categoriasUrls,
    ...productosUrls,
  ];
}