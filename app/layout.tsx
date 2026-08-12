import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { FAQ } from "./lib/faq";

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
  "A brand and marketing studio in Hyderabad. Brand strategy, content production, social media management, websites and search, plus AI content and real-estate previsualisation — one team, one monthly retainer.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "brand marketing agency Hyderabad",
    "social media management Hyderabad",
    "content production Hyderabad",
    "brand film production Hyderabad",
    "video production company Hyderabad",
    "website design and SEO Hyderabad",
    "real estate previsualisation Hyderabad",
    "ProductionX",
  ],
  alternates: { canonical: siteUrl },

  /*
   * Without max-image-preview:large, Google is permitted to show only a
   * thumbnail — or none — which is part of why a stray stock photo could stand
   * in for the page at all. max-snippet:-1 lifts the description length cap so
   * the real description is used instead of text Google picks itself.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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

/** Each service with a sentence of its own — a bare name gives an answer
 *  engine nothing to quote back. */
const SERVICES: [string, string][] = [
  ["Brand strategy and positioning", "Discovery, competitor study, positioning and a twelve-month roadmap agreed before any production begins."],
  ["Content production", "Brand and ad films, reels, product and fashion shoots, events and podcasts, filmed and edited by an in-house crew."],
  ["Social media management", "Content calendar, captions, scheduling, community, growth, competitor tracking, monthly analytics and paid integration."],
  ["Website design, build and SEO", "Websites built to convert the audience the content earns, with keywords, Google Business Profile and local ranking handled before launch."],
  ["AI content generation", "Generated footage, product scenes and concept frames for work with no budget or no time for a full unit."],
  ["Real-estate previsualisation", "Walkthroughs and hero frames of property that is still a drawing, so sales can begin before construction finishes."],
];

/**
 * Structured data so search and AI answer engines describe the studio in its
 * own words instead of guessing from a stray stock image, which is how the
 * previous site ended up with the wrong snippet.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ProductionX",
      alternateName: ["Production X", "Production X Creative Studio"],
      description,
      publisher: { "@id": `${siteUrl}/#studio` },
      inLanguage: "en-IN",
    },
    {
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#studio`,
  name: "ProductionX",
  description,
  url: siteUrl,
  image: `${siteUrl}/og-image.jpg`,
  email: "info@productionx.in",
  telephone: "+91-93919-26846",
  address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
  logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: ["https://instagram.com/productionx.in"],
      knowsAbout: [
        "Brand strategy",
        "Content production",
        "Brand film production",
        "Social media management",
        "Website design and SEO",
        "AI content generation",
        "Real estate previsualisation",
      ],
  slogan: "Every frame earns its place.",
  founder: {
        "@type": "Person",
        name: "Kiran Basa",
        jobTitle: "Founder & Creative Director",
        worksFor: { "@id": `${siteUrl}/#studio` },
        knowsAbout: ["Brand marketing", "Content production", "Creative direction"],
        description:
          "Spent three years brand-side before founding ProductionX — Content Producer at Mercedes-Benz across AP & Telangana, and Head of Creative & Marketing at Ujwala Group.",
      },
  areaServed: "Hyderabad",
  makesOffer: SERVICES.map(([name, description]) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name, description, provider: { "@id": `${siteUrl}/#studio` }, areaServed: "Hyderabad" },
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
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
