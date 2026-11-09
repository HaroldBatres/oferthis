import { MetadataRoute } from "next";

const BASE_URL = "https://www.oferthis.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/test-amazon",
          "/test-aliexpress",
          "/test-supabase",
          "/sign-in",
          "/sign-up",
          "/favoritos",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
