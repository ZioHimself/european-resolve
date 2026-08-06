import type { Metadata } from "next";

const BASE_URL = "https://european-resolve.org";
const PAGE_URL = `${BASE_URL}/events/2026-run-for-ukraine/fundraiser`;
const OG_IMAGE = `${BASE_URL}/og/run-for-ukraine-2026.png`;

export const metadata: Metadata = {
  title: "Fundraiser | 35 Years of 🇺🇦 Independence: Charity and Run",
  description:
    "Support a fundraiser for 35 Years of 🇺🇦 Independence: Charity and Run. All donations go to charging stations for Ukraine's defenders.",
  openGraph: {
    title: "Fundraiser | 35 Years of 🇺🇦 Independence: Charity and Run",
    description:
      "Support a fundraiser for 35 Years of 🇺🇦 Independence: Charity and Run. All donations go to charging stations for Ukraine's defenders.",
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
        alt: "35 Years of 🇺🇦 Independence: Charity and Run, Brussels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fundraiser | 35 Years of 🇺🇦 Independence: Charity and Run",
    description:
      "Support a fundraiser for 35 Years of 🇺🇦 Independence: Charity and Run. All donations go to charging stations for defenders.",
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
