import QRCode from "qrcode";
import type { Member } from "@/data/members";

const ORG_NAME = "European Resolve VZW";

export function parseFirstName(fullName: string): string {
  if (!fullName) return "";
  return fullName.split(" ")[0];
}

export function parseLastName(fullName: string): string {
  if (!fullName) return "";
  const parts = fullName.split(" ");
  return parts.slice(1).join(" ");
}

export function generateVCard(member: Member): string {
  const firstName = parseFirstName(member.name);
  const lastName = parseLastName(member.name);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${lastName};${firstName};;;`,
    `FN:${member.name}`,
    `ORG:${ORG_NAME}`,
    `TITLE:${member.title}`,
  ];

  if (member.email) {
    lines.push(`EMAIL;TYPE=WORK:${member.email}`);
  }

  if (member.phone) {
    lines.push(`TEL;TYPE=WORK:${member.phone}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export async function generateQRSvg(member: Member): Promise<string> {
  const vcard = generateVCard(member);
  return QRCode.toString(vcard, {
    type: "svg",
    margin: 0,
    color: { dark: "#0a1628", light: "#00000000" },
    errorCorrectionLevel: "M",
  });
}
