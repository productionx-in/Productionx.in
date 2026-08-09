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
  title: "Production X Creative — Cinematic & AI Content Studio, Hyderabad",
  description:
    "Cinematic content production, social media management and AI previsualisation for premium brands and property developers across Hyderabad, Vizag and India. We film what exists and generate what doesn't.",
  keywords: [
    "AI previsualisation Hyderabad",
    "real estate previsualisation India",
    "AI content creation for brands",
    "content production Hyderabad",
    "social media management Hyderabad",
    "cinematic content",
    "brand films",
    "Production X",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Production X Creative — Cinematic & AI Content Studio, Hyderabad",
    description:
      "We film what exists and generate what doesn't. Cinematic production, social media and AI previsualisation for premium brands across India.",
    url: siteUrl,
    type: "website",
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Production X Creative — Cinematic & AI Content Studio, Hyderabad",
    description:
      "We film what exists and generate what doesn't. Cinematic production, social media and AI previsualisation for premium brands across India.",
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
