import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { members } from "@/data/members";
import { BusinessCard } from "@/components/ui/BusinessCard";
import { generateQRSvg } from "@/lib/qr";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return members.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = members.find((m) => m.slug === slug);
  if (!member) return {};

  return {
    title: `${member.name} — European Resolve`,
    description: `${member.name}, ${member.title} at European Resolve`,
  };
}

export default async function TeamMemberPage({ params }: Props) {
  const { slug } = await params;
  const member = members.find((m) => m.slug === slug);
  if (!member) notFound();

  const qrSvg = await generateQRSvg(member.slug);

  return <BusinessCard member={member} qrSvg={qrSvg} />;
}
