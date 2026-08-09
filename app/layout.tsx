import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = "https://productionx.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Production X Creative — Every Frame Earns Its Place",
  description:
    "Production X Creative — Premium cinematic content studio and social media management agency. Serving automotive, hospitality, fashion and lifestyle brands across Hyderabad and Vizag.",
  keywords: [
    "content production Hyderabad",
    "social media management Hyderabad",
    "cinematic content",
    "brand films",
    "Production X",
    "premium content agency",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Production X Creative — Every Frame Earns Its Place",
    description:
      "Cinematic content production and social media management for premium brands across South India.",
    url: siteUrl,
    type: "website",
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Production X Creative — Every Frame Earns Its Place",
    description:
      "Cinematic content production and social media management for premium brands across South India.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
