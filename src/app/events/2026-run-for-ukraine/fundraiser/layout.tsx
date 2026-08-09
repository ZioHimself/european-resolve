import type { Metadata } from "next";

const BASE_URL = "https://european-resolve.org";
const PAGE_URL = `${BASE_URL}/events/2026-run-for-ukraine/fundraiser`;
const OG_IMAGE = `${BASE_URL}/og/run-for-ukraine-2026.png`;

export const metadata: Metadata = {
  title: "Fundraiser | Run for Ukraine",
  description:
    "Support a fundraiser for Run for Ukraine. All donations go to portable power stations for Ukraine's air defence units.",
  openGraph: {
    title: "Fundraiser | Run for Ukraine",
    description:
      "Support a fundraiser for Run for Ukraine. All donations go to portable power stations for Ukraine's air defence units.",
    url: PAGE_URL,
    siteName: "European Resolve",
    locale: "en_BE",
    alternateLocale: ["fr_BE", "nl_BE", "de_DE", "uk_UA"],
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Run for Ukraine, Brussels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fundraiser | Run for Ukraine",
    description:
      "Support a fundraiser for Run for Ukraine. All donations go to portable power stations for Ukraine's air defence units.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: PAGE_URL,
    languages: {
      "x-default": PAGE_URL,
      en: PAGE_URL,
      fr: PAGE_URL,
      nl: PAGE_URL,
      de: PAGE_URL,
      uk: PAGE_URL,
    },
  },
};

export default function FundraiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
