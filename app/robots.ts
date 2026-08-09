import { MetadataRoute } from "next";

const BASE_URL = "https://tudominio.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/test-amazon", "/test-supabase"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}