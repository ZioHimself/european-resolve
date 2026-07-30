import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fundraiser — Run for Ukraine 2026",
  description:
    "Support a fundraiser for the Run for Ukraine 2026 charity run. All donations go to charging stations for Ukraine's defenders.",
};

export default function FundraiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
