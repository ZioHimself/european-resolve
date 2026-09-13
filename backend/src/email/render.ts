import { getEmailLocale } from "./locales/index.js";

const EVENT_PAGE_URL =
  "https://european-resolve.org/events/2026-run-for-ukraine/";
const HURKIT_URL = "https://hurkit.org/";
const MERCH_CONTACT_EMAIL = "olena.kuzhym@european-resolve.org";
const UNSUBSCRIBE_EMAIL = "info@european-resolve.org";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface DeploymentUpdateEmailData {
  name: string;
  email: string;
}

function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replaceAll(`{${key}}`, String(value));
  }
  return result;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function linkFirstOccurrenceHtml(
  text: string,
  linkText: string,
  url: string,
  linkStyle: string,
): string {
  const index = text.indexOf(linkText);
  if (index === -1) return escapeHtml(text);

  const before = escapeHtml(text.slice(0, index));
  const after = escapeHtml(text.slice(index + linkText.length));
  return `${before}<a href="${url}" style="${linkStyle}">${escapeHtml(linkText)}</a>${after}`;
}

const DEPLOYMENT_BULLET_KEYS = [
  "deploymentUpdateBullet1",
  "deploymentUpdateBullet2",
  "deploymentUpdateBullet3",
  "deploymentUpdateBullet4",
  "deploymentUpdateBullet5",
] as const;

export function renderDeploymentUpdateEmail(
  data: DeploymentUpdateEmailData,
  localeCode: string,
): RenderedEmail {
  const l = getEmailLocale(localeCode);
  const params = { name: data.name };

  const subject = l.deploymentUpdateSubject;
  const greeting = interpolate(l.greeting, params);
  const intro2Html = linkFirstOccurrenceHtml(
    l.deploymentUpdateIntro2,
    l.hurkitFoundationName,
    HURKIT_URL,
    "color:#0057b8;text-decoration:underline;word-break:break-all;",
  );

  const merchBodyHtml = linkFirstOccurrenceHtml(
    l.deploymentUpdateMerchBody,
    MERCH_CONTACT_EMAIL,
    `mailto:${MERCH_CONTACT_EMAIL}`,
    "color:#0057b8;text-decoration:underline;word-break:break-all;",
  );

  const bullets = DEPLOYMENT_BULLET_KEYS.map((key) => l[key]);
  const bulletsHtml = bullets
    .map(
      (bullet) =>
        `<li style="margin-bottom:8px;">${escapeHtml(bullet)}</li>`,
    )
    .join("");
  const bulletsText = bullets.map((bullet) => `- ${bullet}`).join("\n");

  const linkStyle =
    "color:#0057b8;text-decoration:underline;word-break:break-all;";
  const pStyle = "margin:0 0 16px;font-size:16px;color:#0a1628;line-height:1.5;";
  const h2Style = "margin:0 0 12px;font-size:16px;color:#0a1628;";
  const ulStyle =
    "margin:0 0 16px;padding-left:20px;font-size:14px;color:#0a1628;line-height:1.5;";

  const html = `<!DOCTYPE html>
<html lang="${localeCode}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f2eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f2eb;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#0057b8;padding:24px 32px;">
              <h1 style="margin:0;color:#ffd700;font-size:20px;font-weight:700;">${escapeHtml(l.eventName)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="${pStyle}">${escapeHtml(greeting)}</p>
              <p style="${pStyle}">${escapeHtml(l.deploymentUpdateIntro1)}</p>
              <p style="${pStyle}">${intro2Html}</p>
              <h2 style="${h2Style}">${escapeHtml(l.deploymentUpdateHeading)}</h2>
              <ul style="${ulStyle}">${bulletsHtml}</ul>
              <h2 style="${h2Style}">${escapeHtml(l.deploymentUpdateMerchHeading)}</h2>
              <p style="${pStyle}">${merchBodyHtml}</p>
              <p style="${pStyle}">${escapeHtml(l.deploymentUpdateEventPageIntro)}</p>
              <p style="margin:0 0 16px;font-size:14px;color:#333;"><a href="${EVENT_PAGE_URL}" style="${linkStyle}">${EVENT_PAGE_URL}</a></p>
              <p style="${pStyle}">${escapeHtml(l.deploymentUpdateClosing)}</p>
              <p style="margin:0;font-size:16px;color:#0a1628;">${escapeHtml(l.footerText)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background-color:#f5f2eb;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#666;line-height:1.5;">${escapeHtml(l.deploymentUpdateUnsubscribe)} <a href="mailto:${UNSUBSCRIBE_EMAIL}" style="${linkStyle}">${UNSUBSCRIBE_EMAIL}</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${greeting}

${l.deploymentUpdateIntro1}

${l.deploymentUpdateIntro2}

${l.deploymentUpdateHeading}

${bulletsText}

${l.deploymentUpdateMerchHeading}

${l.deploymentUpdateMerchBody}

${l.deploymentUpdateEventPageIntro}
${EVENT_PAGE_URL}

${l.deploymentUpdateClosing}

${l.footerText}

${l.deploymentUpdateUnsubscribe}`;

  return { subject, html, text };
}
