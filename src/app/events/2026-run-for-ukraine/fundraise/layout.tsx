import type { Metadata } from "next";

const BASE_URL = "https://european-resolve.org";
const PAGE_URL = `${BASE_URL}/events/2026-run-for-ukraine/fundraise`;
const OG_IMAGE = `${BASE_URL}/og/run-for-ukraine-2026.png`;

export const metadata: Metadata = {
  title: "Fundraise | Run for Ukraine",
  description:
    "Create your personal fundraising page for Run for Ukraine in Brussels. Help fund portable power stations for Ukraine's air defence units.",
  openGraph: {
    title: "Fundraise | Run for Ukraine",
    description:
      "Create your personal fundraising page for Run for Ukraine in Brussels. Help fund portable power stations for Ukraine's air defence units.",
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
    title: "Fundraise | Run for Ukraine",
    description:
      "Create your personal fundraising page for Run for Ukraine. Help fund portable power stations for Ukraine's air defence units.",
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

export default function FundraiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
