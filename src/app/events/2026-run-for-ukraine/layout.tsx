import type { Metadata } from "next";
import { LocaleProvider } from "@/components/ui/LocaleProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { eventDetails, tiers } from "@/data/event";
import styles from "./layout.module.css";

const BASE_URL = "https://european-resolve.org";
const EVENT_PATH = "/events/2026-run-for-ukraine";
const OG_IMAGE = `${BASE_URL}/og/run-for-ukraine-2026.png`;

export const metadata: Metadata = {
  title: "Run for Ukraine: Charity Run for 35 Years of Independence | European Resolve",
  description:
    "Join us in Brussels on 23 August 2026 for the Run for Ukraine. Register, fundraise, and help Hurkit provide portable power stations for Ukraine's air defence units.",
  openGraph: {
    title: "Run for Ukraine: Charity Run for 35 Years of Independence, Brussels",
    description:
      "Join us in Brussels on 23 August 2026 for the Run for Ukraine. Register, fundraise, and help Hurkit provide portable power stations for Ukraine's air defence units.",
    url: `${BASE_URL}${EVENT_PATH}`,
    siteName: "European Resolve",
    locale: "en_BE",
    alternateLocale: ["fr_BE", "nl_BE", "de_DE", "uk_UA"],
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Run for Ukraine: Charity Run for 35 Years of Independence, Brussels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Run for Ukraine: Charity Run for 35 Years of Independence, Brussels",
    description:
      "Join us in Brussels on 23 August 2026 for the Run for Ukraine. Register, fundraise, and help Hurkit provide portable power stations for Ukraine's air defence units.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: `${BASE_URL}${EVENT_PATH}`,
    languages: {
      "x-default": `${BASE_URL}${EVENT_PATH}`,
      en: `${BASE_URL}${EVENT_PATH}`,
      fr: `${BASE_URL}${EVENT_PATH}`,
      nl: `${BASE_URL}${EVENT_PATH}`,
      de: `${BASE_URL}${EVENT_PATH}`,
      uk: `${BASE_URL}${EVENT_PATH}`,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: eventDetails.title,
  startDate: "2026-08-23",
  location: {
    "@type": "Place",
    name: eventDetails.location,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brussels",
      addressCountry: "BE",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "European Resolve",
    url: BASE_URL,
  },
  description: eventDetails.seoDescription,
  offers: {
    "@type": "AggregateOffer",
    lowPrice: String(Math.min(...tiers.map((t) => t.price))),
    highPrice: String(Math.max(...tiers.map((t) => t.price))),
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${BASE_URL}${EVENT_PATH}/register`,
  },
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: OG_IMAGE,
  url: `${BASE_URL}${EVENT_PATH}`,
};

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.eventRoot}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocaleProvider>
        <div className={styles.langBar}>
          <div className={styles.langBarInner}>
            <LanguageSwitcher />
          </div>
        </div>
        {children}
      </LocaleProvider>
    </div>
  );
}
