import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Oferthis - Las mejores ofertas de Amazon, eBay, AliExpress y SHEIN",
    template: "%s | Oferthis",
  },
  description:
    "Descubre las mejores ofertas y descuentos actualizados de Amazon, eBay, AliExpress, SHEIN y más. Ahorra dinero todos los días con Oferthis.",
      openGraph: {
    title: "Oferthis - Las mejores ofertas",
    description:
      "Ofertas reales de Amazon, eBay, AliExpress y SHEIN actualizadas automáticamente.",
    url: "https://oferthis.vercel.app",
    siteName: "Oferthis",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "https://oferthis.vercel.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "Oferthis - Las mejores ofertas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oferthis - Las mejores ofertas",
    description:
      "Ofertas reales de Amazon, eBay, AliExpress y SHEIN actualizadas automáticamente.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}