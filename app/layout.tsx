import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
  keywords: [
    "ofertas",
    "descuentos",
    "Amazon",
    "eBay",
    "AliExpress",
    "SHEIN",
    "chollos",
    "Oferthis",
  ],
  openGraph: {
    title: "Oferthis - Las mejores ofertas",
    description:
      "Encuentra descuentos reales de Amazon y otras tiendas. Productos actualizados automáticamente.",
    type: "website",
    locale: "es_ES",
    siteName: "Oferthis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oferthis - Las mejores ofertas",
    description: "Encuentra descuentos reales de Amazon y otras tiendas.",
  },
  robots: {
    index: true,
    follow: true,
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