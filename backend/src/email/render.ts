import { getEmailLocale } from "./locales/index.js";

export interface RegistrationEmailData {
  name: string;
  email: string;
  participantId: string;
  tierName: string;
  amountEur: number;
  rewards: string[];
  donationUrl: string;
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

export function renderConfirmationEmail(
  data: RegistrationEmailData,
  localeCode: string,
): { subject: string; html: string } {
  const l = getEmailLocale(localeCode);
  const params = {
    name: data.name,
    tierName: data.tierName,
    amount: data.amountEur,
  };

  const subject = interpolate(l.subject, params);
  const greeting = interpolate(l.greeting, params);
  const intro = interpolate(l.confirmationIntro, params);
  const donationInstructions = interpolate(l.donationInstructions, params);
  const donationButton = interpolate(l.donationButton, params);

  const rewardsList = data.rewards
    .map((r) => `<li style="margin-bottom:4px;">${escapeHtml(r)}</li>`)
    .join("");

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
          <!-- Header -->
          <tr>
            <td style="background-color:#0057b8;padding:24px 32px;">
              <h1 style="margin:0;color:#ffd700;font-size:20px;font-weight:700;">Run for Ukraine 2026</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#0a1628;">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 24px;font-size:16px;color:#0a1628;">${escapeHtml(intro)}</p>

              <!-- Registration details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;background-color:#f9f9f9;border-bottom:1px solid #e5e5e5;font-size:14px;color:#666;">${escapeHtml(l.participantIdLabel)}</td>
                  <td style="padding:12px 16px;background-color:#f9f9f9;border-bottom:1px solid #e5e5e5;font-size:14px;font-weight:600;color:#0a1628;">${escapeHtml(data.participantId)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e5e5;font-size:14px;color:#666;">${escapeHtml(l.tierLabel)}</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e5e5;font-size:14px;color:#0a1628;">${escapeHtml(data.tierName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#666;">${escapeHtml(l.amountLabel)}</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;">&euro;${data.amountEur}</td>
                </tr>
              </table>

              <!-- Rewards -->
              <h2 style="margin:0 0 12px;font-size:16px;color:#0a1628;">${escapeHtml(l.rewardsLabel)}</h2>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#0a1628;">
                ${rewardsList}
              </ul>

              <!-- Donation CTA -->
              <div style="margin-bottom:24px;padding:20px;background-color:#fff8e1;border-radius:6px;border:1px solid #ffd700;">
                <h2 style="margin:0 0 8px;font-size:16px;color:#0a1628;">${escapeHtml(l.donationHeading)}</h2>
                <p style="margin:0 0 16px;font-size:14px;color:#333;">${escapeHtml(donationInstructions)}</p>
                <a href="${escapeHtml(data.donationUrl)}" style="display:inline-block;padding:12px 24px;background-color:#0057b8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">${escapeHtml(donationButton)}</a>
              </div>

              <!-- Event details -->
              <h2 style="margin:0 0 8px;font-size:16px;color:#0a1628;">${escapeHtml(l.eventDetailsHeading)}</h2>
              <p style="margin:0 0 4px;font-size:14px;color:#333;">📅 ${escapeHtml(l.eventDate)}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#333;">📍 ${escapeHtml(l.eventLocation)}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f5f2eb;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 8px;font-size:12px;color:#666;">${escapeHtml(l.footerText)}</p>
              <p style="margin:0;font-size:12px;color:#999;">${escapeHtml(l.footerUnsubscribe)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

export interface FundraiserEmailData extends RegistrationEmailData {
  slug: string;
  editToken: string;
  displayName: string;
  fundraiserGoalEur: number;
  siteUrl: string;
}

export function renderFundraiserEmail(
  data: FundraiserEmailData,
  localeCode: string,
): { subject: string; html: string } {
  const l = getEmailLocale(localeCode);
  const params = {
    name: data.name,
    tierName: data.tierName,
    amount: data.amountEur,
  };

  const subject = interpolate(l.fundraiserSubject, params);
  const greeting = interpolate(l.greeting, params);
  const intro = interpolate(l.fundraiserIntro, params);
  const donationInstructions = interpolate(l.donationInstructions, params);
  const donationButton = interpolate(l.donationButton, params);

  const rewardsList = data.rewards
    .map((r) => `<li style="margin-bottom:4px;">${escapeHtml(r)}</li>`)
    .join("");

  const fundraiserPageUrl = `${data.siteUrl}/events/2026-run-for-ukraine/fundraiser?by=${encodeURIComponent(data.slug)}`;
  const fundraiserEditUrl = `${fundraiserPageUrl}&edit=${encodeURIComponent(data.editToken)}`;

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
          <!-- Header -->
          <tr>
            <td style="background-color:#0057b8;padding:24px 32px;">
              <h1 style="margin:0;color:#ffd700;font-size:20px;font-weight:700;">Run for Ukraine 2026</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#0a1628;">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 24px;font-size:16px;color:#0a1628;">${escapeHtml(intro)}</p>

              <!-- Registration details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;background-color:#f9f9f9;border-bottom:1px solid #e5e5e5;font-size:14px;color:#666;">${escapeHtml(l.participantIdLabel)}</td>
                  <td style="padding:12px 16px;background-color:#f9f9f9;border-bottom:1px solid #e5e5e5;font-size:14px;font-weight:600;color:#0a1628;">${escapeHtml(data.participantId)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e5e5;font-size:14px;color:#666;">${escapeHtml(l.tierLabel)}</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e5e5;font-size:14px;color:#0a1628;">${escapeHtml(data.tierName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#666;">${escapeHtml(l.amountLabel)}</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;">&euro;${data.amountEur}</td>
                </tr>
              </table>

              <!-- Rewards -->
              <h2 style="margin:0 0 12px;font-size:16px;color:#0a1628;">${escapeHtml(l.rewardsLabel)}</h2>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#0a1628;">
                ${rewardsList}
              </ul>

              <!-- Fundraiser details -->
              <div style="margin-bottom:24px;padding:20px;background-color:#f0f7ff;border-radius:6px;border:1px solid #0057b8;">
                <h2 style="margin:0 0 16px;font-size:16px;color:#0057b8;">${escapeHtml(l.fundraiserHeading)}</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#666;width:40%;">${escapeHtml(l.fundraiserDisplayNameLabel)}</td>
                    <td style="padding:8px 0;font-size:14px;color:#0a1628;">${escapeHtml(data.displayName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#666;">${escapeHtml(l.fundraiserGoalLabel)}</td>
                    <td style="padding:8px 0;font-size:14px;color:#0a1628;">&euro;${data.fundraiserGoalEur}</td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:14px;color:#333;font-weight:600;">${escapeHtml(l.fundraiserPageLabel)}</p>
                <p style="margin:0 0 16px;font-size:14px;"><a href="${escapeHtml(fundraiserPageUrl)}" style="color:#0057b8;text-decoration:underline;word-break:break-all;">${escapeHtml(fundraiserPageUrl)}</a></p>
                <p style="margin:0 0 8px;font-size:14px;color:#333;font-weight:600;">${escapeHtml(l.fundraiserEditLabel)}</p>
                <p style="margin:0 0 8px;font-size:14px;"><a href="${escapeHtml(fundraiserEditUrl)}" style="color:#0057b8;text-decoration:underline;word-break:break-all;">${escapeHtml(fundraiserEditUrl)}</a></p>
                <p style="margin:0;font-size:12px;color:#c41e3a;font-style:italic;">${escapeHtml(l.fundraiserEditHint)}</p>
              </div>

              <!-- Donation CTA -->
              <div style="margin-bottom:24px;padding:20px;background-color:#fff8e1;border-radius:6px;border:1px solid #ffd700;">
                <h2 style="margin:0 0 8px;font-size:16px;color:#0a1628;">${escapeHtml(l.donationHeading)}</h2>
                <p style="margin:0 0 16px;font-size:14px;color:#333;">${escapeHtml(donationInstructions)}</p>
                <a href="${escapeHtml(data.donationUrl)}" style="display:inline-block;padding:12px 24px;background-color:#0057b8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">${escapeHtml(donationButton)}</a>
              </div>

              <!-- Event details -->
              <h2 style="margin:0 0 8px;font-size:16px;color:#0a1628;">${escapeHtml(l.eventDetailsHeading)}</h2>
              <p style="margin:0 0 4px;font-size:14px;color:#333;">📅 ${escapeHtml(l.eventDate)}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#333;">📍 ${escapeHtml(l.eventLocation)}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f5f2eb;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 8px;font-size:12px;color:#666;">${escapeHtml(l.footerText)}</p>
              <p style="margin:0;font-size:12px;color:#999;">${escapeHtml(l.footerUnsubscribe)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
