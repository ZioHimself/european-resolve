import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fundraise — Run for Ukraine 2026",
  description:
    "Create your personal fundraising page for the Run for Ukraine 2026 charity run in Brussels. Help fund charging stations for defenders.",
};

export default function FundraiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
