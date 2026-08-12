import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Three voices, each with a job.
 *
 * Instrument Serif is a high-contrast titling face — it reads as a film title
 * card at large sizes, which is the whole point; it is never used for body.
 * Inter carries every word a visitor actually reads: it was chosen over the
 * Tight cut because condensed body text read as cramped at paragraph length.
 * JetBrains Mono is the slate — codes, labels and figures, always tabular.
 */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = "https://productionx.in";
const title = "ProductionX — Brand, Marketing & Content Studio, Hyderabad";
const description =
  "A brand and marketing studio in Hyderabad, Vizag and across India. Brand strategy, content production, social media management, websites and search, plus AI content and real-estate previsualisation — one team, one monthly retainer.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "brand marketing agency Hyderabad",
    "social media management Hyderabad",
    "content production Hyderabad",
    "brand film production Hyderabad",
    "digital marketing agency Vizag",
    "website design and SEO Hyderabad",
    "AI previsualisation real estate India",
    "ProductionX",
  ],
  alternates: { canonical: siteUrl },
  icons: {
    icon: [
      { url: "/mark.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "ProductionX",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ProductionX — content studio, Hyderabad" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
};

/**
 * Structured data so search and AI answer engines describe the studio in its
 * own words instead of guessing from a stray stock image, which is how the
 * previous site ended up with the wrong snippet.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "ProductionX",
  description,
  url: siteUrl,
  image: `${siteUrl}/og-image.jpg`,
  email: "info@productionx.in",
  telephone: "+91-93919-26846",
  address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
  sameAs: ["https://instagram.com/productionx.in"],
  slogan: "Every frame earns its place.",
  founder: { "@type": "Person", name: "Kiran Basa" },
  areaServed: ["Hyderabad", "Visakhapatnam", "India"],
  makesOffer: [
    "Brand strategy and positioning",
    "Content production",
    "Social media management",
    "Website design, build and SEO",
    "AI content generation",
    "Real-estate previsualisation",
  ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
