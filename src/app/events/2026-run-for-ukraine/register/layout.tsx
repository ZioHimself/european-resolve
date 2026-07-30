import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — Run for Ukraine 2026",
  description:
    "Choose your tier and register for the Run for Ukraine 2026 charity run in Brussels. Every fee helps fund charging stations for defenders.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
