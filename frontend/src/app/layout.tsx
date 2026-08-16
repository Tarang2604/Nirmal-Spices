import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Lato, Noto_Serif_Devanagari, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["300", "400", "700"],
  display: "swap",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-noto-serif-devanagari",
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nirmalspices.in"),
  title: {
    default: "Nirmal's Spices | Pure & Authentic Indian Spices from Harda, MP",
    template: "%s | Nirmal's Spices",
  },
  description:
    "Discover 58+ varieties of authentic, premium Indian spices sourced directly from local farmers in Harda, Madhya Pradesh. Purity guaranteed, hygienically processed, eco-friendly packaging.",
  keywords: [
    "Nirmal spices",
    "pure spices India",
    "authentic Indian masalas",
    "Harda spices manufacturer",
    "organic ground spices",
    "whole spices export Madhya Pradesh",
  ],
  authors: [{ name: "Nirmal's Spices Team" }],
  openGraph: {
    title: "Nirmal's Spices | Pure & Authentic Indian Spices",
    description:
      "Direct from local farmers in Harda, MP to your kitchen. Explore our 58+ premium spice varieties.",
    url: "https://nirmalspices.in",
    siteName: "Nirmal's Spices",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nirmal's Spices | Pure & Authentic Indian Spices",
    description:
      "Direct from local farmers in Harda, MP to your kitchen. Explore our 58+ premium spice varieties.",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#C0392B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${lato.variable} ${notoSerifDevanagari.variable} ${cormorantGaramond.variable} h-full scroll-smooth antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="bg-background text-foreground min-h-full flex flex-col font-sans"
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
