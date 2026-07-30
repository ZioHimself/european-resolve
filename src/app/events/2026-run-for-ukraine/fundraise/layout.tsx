import type { Metadata } from "next";

const BASE_URL = "https://european-resolve.org";
const PAGE_URL = `${BASE_URL}/events/2026-run-for-ukraine/fundraise`;
const OG_IMAGE = `${BASE_URL}/og/run-for-ukraine-2026.png`;

export const metadata: Metadata = {
  title: "Fundraise — Run for Ukraine 2026",
  description:
    "Create your personal fundraising page for the Run for Ukraine 2026 charity run in Brussels. Help fund charging stations for defenders.",
  openGraph: {
    title: "Fundraise — Run for Ukraine 2026",
    description:
      "Create your personal fundraising page for the Run for Ukraine 2026 charity run in Brussels. Help fund charging stations for defenders.",
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
        alt: "Run for Ukraine 2026 — Brussels charity run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fundraise — Run for Ukraine 2026",
    description:
      "Create your personal fundraising page for the Run for Ukraine 2026 charity run. Help fund charging stations for defenders.",
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
