import type { Metadata } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Three voices, each with a job.
 *
 * Instrument Serif is a high-contrast titling face — it reads as a film title
 * card at large sizes, which is the whole point; it is never used for body.
 * Inter Tight carries every word a visitor actually reads. JetBrains Mono is
 * the slate: codes, timecodes, labels and figures, always tabular.
 */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter_Tight({
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
const title = "ProductionX — Content Studio & AI Previsualisation, Hyderabad";
const description =
  "A Hyderabad content studio. Brand films, campaign and social content shot with a real crew — plus AI previsualisation that lets property buyers walk a building before it is built.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "content production Hyderabad",
    "brand film production Hyderabad",
    "AI previsualisation real estate India",
    "architectural walkthrough Hyderabad",
    "AI content creation for brands",
    "social media content production",
    "ProductionX",
  ],
  alternates: { canonical: siteUrl },
  icons: { icon: "/favicon.ico", apple: "/logo.png" },
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
  areaServed: "IN",
  address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
  sameAs: ["https://instagram.com/productionx.in"],
  makesOffer: [
    "Brand film production",
    "Campaign and social content",
    "AI content generation",
    "Real-estate previsualisation",
    "Website design and build",
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
