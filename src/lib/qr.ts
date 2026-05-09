import QRCode from "qrcode";

const BASE_URL = "https://european-resolve.org";

export async function generateQRSvg(slug: string): Promise<string> {
  const url = `${BASE_URL}/team/${slug}`;
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    color: { dark: "#0a1628", light: "#00000000" },
    errorCorrectionLevel: "M",
  });
}
