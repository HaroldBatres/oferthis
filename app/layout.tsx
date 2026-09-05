import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import CookieBanner from "./components/CookieBanner";
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
  metadataBase: new URL("https://oferthis.com"),
  title: {
    default:
      "Oferthis - Las mejores ofertas de Amazon, eBay, AliExpress y SHEIN",
    template: "%s | Oferthis",
  },
  description:
    "Descubre las mejores ofertas y descuentos actualizados de Amazon, eBay, AliExpress, SHEIN y más.",
  openGraph: {
    title: "Oferthis - Las mejores ofertas",
    description:
      "Ofertas reales de Amazon, eBay, AliExpress y SHEIN actualizadas automáticamente.",
    url: "https://oferthis.com",
    siteName: "Oferthis",
    locale: "es_ES",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html
        lang={locale}
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <CookieBanner />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}