import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Dominio canónico: www.oferthis.com. La URL de producción de Vercel
  // (oferthis.vercel.app) redirige aquí conservando ruta y parámetros.
  // Las URLs de preview (oferthis-xxxx.vercel.app) y localhost no se tocan.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "oferthis.vercel.app" }],
        destination: "https://www.oferthis.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xc-goods.oss-cn-shenzhen.aliyuncs.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "**.aliyuncs.com", pathname: "/**" },
      { protocol: "https", hostname: "**.alicdn.com", pathname: "/**" },
      { protocol: "https", hostname: "**.aliexpress-media.com", pathname: "/**" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "**.media-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "**.ssl-images-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ebayimg.com", pathname: "/**" },
      { protocol: "https", hostname: "**.ebayimg.com", pathname: "/**" },
      { protocol: "https", hostname: "imagessl.casadellibro.com", pathname: "/**" },
    ],
  },
};

export default withNextIntl(nextConfig);
