import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "**.amazon.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default withNextIntl(nextConfig);