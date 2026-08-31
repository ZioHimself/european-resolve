import { getEmailLocale } from "./locales/index.js";
import type { DelayedRewardKey, EmailLocale } from "./locales/types.js";

const COLLECTION_EMAIL = "info@european-resolve.org";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

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
): RenderedEmail {
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
              <h1 style="margin:0;color:#ffd700;font-size:20px;font-weight:700;">${escapeHtml(l.eventName)}</h1>
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
              <h2 style="margin:0 0 12px;font-size:16px;color:#0a1628;">${escapeHtml(l.rewardsLabelPending)}</h2>
              <ul style="margin:0 0 8px;padding-left:20px;font-size:14px;color:#0a1628;">
                ${rewardsList}
              </ul>
              ${renderPhysicalRewardsNoticeHtml(l, data.rewards)}
              <p style="margin:0 0 24px;font-size:12px;color:#666;font-style:italic;">${escapeHtml(l.rewardsDisclaimer)}</p>

              <!-- Donation CTA -->
              <div style="margin-bottom:24px;padding:20px;background-color:#fff8e1;border-radius:6px;border:1px solid #ffd700;">
                <h2 style="margin:0 0 8px;font-size:16px;color:#0a1628;">${escapeHtml(l.donationHeading)}</h2>
                <p style="margin:0 0 12px;font-size:13px;color:#666;font-style:italic;">${escapeHtml(l.alreadyPaidNotice)}</p>
                <p style="margin:0 0 16px;font-size:14px;color:#333;">${escapeHtml(donationInstructions)}</p>
                <a href="${escapeHtml(data.donationUrl)}" style="display:inline-block;padding:12px 24px;background-color:#0057b8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">${escapeHtml(donationButton)}</a>
              </div>

              <!-- Event details -->
              <h2 style="margin:0 0 8px;font-size:16px;color:#0a1628;">${escapeHtml(l.eventDetailsHeading)}</h2>
              <p style="margin:0 0 4px;font-size:14px;color:#333;">${escapeHtml(l.eventDate)}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#333;"><a href="https://maps.google.com/?q=Place+du+Luxembourg,+Brussels,+Belgium" style="color:#0057b8;text-decoration:underline;">${escapeHtml(l.eventLocation)}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f5f2eb;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 8px;font-size:12px;color:#666;">${escapeHtml(l.footerText)}</p>
              <p style="margin:0 0 4px;font-size:12px;color:#999;">${escapeHtml(l.footerPaymentEmail)}</p>
              <p style="margin:0;font-size:12px;color:#999;">${escapeHtml(l.footerUnsubscribe)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    greeting,
    "",
    intro,
    "",
    `${l.participantIdLabel}: ${data.participantId}`,
    `${l.tierLabel}: ${data.tierName}`,
    `${l.amountLabel}: EUR ${data.amountEur}`,
    "",
    l.rewardsLabelPending,
    formatTextList(data.rewards),
    "",
    ...formatPhysicalRewardsNoticeText(l, data.rewards),
    l.rewardsDisclaimer,
    "",
    l.donationHeading,
    l.alreadyPaidNotice,
    donationInstructions,
    `${donationButton}: ${data.donationUrl}`,
    "",
    l.eventDetailsHeading,
    l.eventDate,
    l.eventLocation,
    "https://maps.google.com/?q=Place+du+Luxembourg,+Brussels,+Belgium",
    "",
    l.footerText,
    l.footerPaymentEmail,
    l.footerUnsubscribe,
  ].join("\n");

  return { subject, html, text };
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
): RenderedEmail {
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
              <h1 style="margin:0;color:#ffd700;font-size:20px;font-weight:700;">${escapeHtml(l.eventName)}</h1>
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
              <h2 style="margin:0 0 12px;font-size:16px;color:#0a1628;">${escapeHtml(l.rewardsLabelPending)}</h2>
              <ul style="margin:0 0 8px;padding-left:20px;font-size:14px;color:#0a1628;">
                ${rewardsList}
              </ul>
              ${renderPhysicalRewardsNoticeHtml(l, data.rewards)}
              <p style="margin:0 0 24px;font-size:12px;color:#666;font-style:italic;">${escapeHtml(l.rewardsDisclaimer)}</p>

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
                <p style="margin:0 0 12px;font-size:13px;color:#666;font-style:italic;">${escapeHtml(l.alreadyPaidNotice)}</p>
                <p style="margin:0 0 16px;font-size:14px;color:#333;">${escapeHtml(donationInstructions)}</p>
                <a href="${escapeHtml(data.donationUrl)}" style="display:inline-block;padding:12px 24px;background-color:#0057b8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">${escapeHtml(donationButton)}</a>
              </div>

              <!-- Event details -->
              <h2 style="margin:0 0 8px;font-size:16px;color:#0a1628;">${escapeHtml(l.eventDetailsHeading)}</h2>
              <p style="margin:0 0 4px;font-size:14px;color:#333;">${escapeHtml(l.eventDate)}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#333;"><a href="https://maps.google.com/?q=Place+du+Luxembourg,+Brussels,+Belgium" style="color:#0057b8;text-decoration:underline;">${escapeHtml(l.eventLocation)}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f5f2eb;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 8px;font-size:12px;color:#666;">${escapeHtml(l.footerText)}</p>
              <p style="margin:0 0 4px;font-size:12px;color:#999;">${escapeHtml(l.footerPaymentEmail)}</p>
              <p style="margin:0;font-size:12px;color:#999;">${escapeHtml(l.footerUnsubscribe)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    greeting,
    "",
    intro,
    "",
    `${l.participantIdLabel}: ${data.participantId}`,
    `${l.tierLabel}: ${data.tierName}`,
    `${l.amountLabel}: EUR ${data.amountEur}`,
    "",
    l.rewardsLabelPending,
    formatTextList(data.rewards),
    "",
    ...formatPhysicalRewardsNoticeText(l, data.rewards),
    l.rewardsDisclaimer,
    "",
    l.fundraiserHeading,
    `${l.fundraiserDisplayNameLabel}: ${data.displayName}`,
    `${l.fundraiserGoalLabel}: EUR ${data.fundraiserGoalEur}`,
    `${l.fundraiserPageLabel}: ${fundraiserPageUrl}`,
    `${l.fundraiserEditLabel}: ${fundraiserEditUrl}`,
    l.fundraiserEditHint,
    "",
    l.donationHeading,
    l.alreadyPaidNotice,
    donationInstructions,
    `${donationButton}: ${data.donationUrl}`,
    "",
    l.eventDetailsHeading,
    l.eventDate,
    l.eventLocation,
    "https://maps.google.com/?q=Place+du+Luxembourg,+Brussels,+Belgium",
    "",
    l.footerText,
    l.footerPaymentEmail,
    l.footerUnsubscribe,
  ].join("\n");

  return { subject, html, text };
}

export interface PaymentConfirmationEmailData {
  name: string;
  email: string;
  participantId: string;
  tierName: string;
  /** Absent when the actually-paid amount couldn't be determined — never assumed. */
  amountEur?: number;
  rewards: string[];
}

export function renderPaymentConfirmationEmail(
  data: PaymentConfirmationEmailData,
  localeCode: string,
): RenderedEmail {
  const l = getEmailLocale(localeCode);
  const params = {
    name: data.name,
    tierName: data.tierName,
  };

  const subject = interpolate(l.paymentSubject, params);
  const greeting = interpolate(l.greeting, params);
  const intro = interpolate(l.paymentIntro, params);

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
              <h1 style="margin:0;color:#ffd700;font-size:20px;font-weight:700;">${escapeHtml(l.eventName)}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#0a1628;">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 24px;font-size:16px;color:#0a1628;">${escapeHtml(intro)}</p>

              <!-- Confirmed details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;background-color:#f9f9f9;border-bottom:1px solid #e5e5e5;font-size:14px;color:#666;">${escapeHtml(l.participantIdLabel)}</td>
                  <td style="padding:12px 16px;background-color:#f9f9f9;border-bottom:1px solid #e5e5e5;font-size:14px;font-weight:600;color:#0a1628;">${escapeHtml(data.participantId)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;${data.amountEur != null ? "border-bottom:1px solid #e5e5e5;" : ""}font-size:14px;color:#666;">${escapeHtml(l.tierLabel)}</td>
                  <td style="padding:12px 16px;${data.amountEur != null ? "border-bottom:1px solid #e5e5e5;" : ""}font-size:14px;color:#0a1628;">${escapeHtml(data.tierName)}</td>
                </tr>
                ${
                  data.amountEur != null
                    ? `<tr>
                  <td style="padding:12px 16px;font-size:14px;color:#666;">${escapeHtml(l.amountLabel)}</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;">&euro;${data.amountEur}</td>
                </tr>`
                    : ""
                }
              </table>

              <!-- Rewards -->
              <h2 style="margin:0 0 12px;font-size:16px;color:#0a1628;">${escapeHtml(l.paymentRewardsLabel)}</h2>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#0a1628;">
                ${rewardsList}
              </ul>
              ${renderPhysicalRewardsNoticeHtml(l, data.rewards)}

              <!-- Thank you -->
              <div style="margin-bottom:24px;padding:20px;background-color:#e8f5e9;border-radius:6px;border:1px solid #4caf50;">
                <p style="margin:0;font-size:14px;color:#2e7d32;">${escapeHtml(l.paymentThankYou)}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f5f2eb;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#666;">${escapeHtml(l.paymentFooter)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const detailLines = [
    `${l.participantIdLabel}: ${data.participantId}`,
    `${l.tierLabel}: ${data.tierName}`,
  ];
  if (data.amountEur != null) {
    detailLines.push(`${l.amountLabel}: EUR ${data.amountEur}`);
  }

  const text = [
    greeting,
    "",
    intro,
    "",
    ...detailLines,
    "",
    l.paymentRewardsLabel,
    formatTextList(data.rewards),
    "",
    ...formatPhysicalRewardsNoticeText(l, data.rewards),
    l.paymentThankYou,
    "",
    l.paymentFooter,
  ].join("\n");

  return { subject, html, text };
}

export interface DelayedRewardsEmailData {
  name: string;
  email: string;
  participantId: string;
  delayedRewardKeys: DelayedRewardKey[];
  /** True when the tier includes raffle tickets and/or the Ukrainian meal. */
  hasEventDayRewards: boolean;
}

export function localizeDelayedRewardKeys(
  keys: DelayedRewardKey[],
  localeCode: string,
): string[] {
  const l = getEmailLocale(localeCode);
  return keys.map((key) => l.delayedRewardLabels[key]);
}

export function renderDelayedRewardsEmail(
  data: DelayedRewardsEmailData,
  localeCode: string,
): RenderedEmail {
  const l = getEmailLocale(localeCode);
  const params = { name: data.name };
  const subject = interpolate(l.delayedRewardsSubject, params);
  const greeting = interpolate(l.greeting, params);
  const intro = interpolate(l.delayedRewardsIntro, params);
  const delayedRewards = localizeDelayedRewardKeys(
    data.delayedRewardKeys,
    localeCode,
  );

  const delayedList = delayedRewards
    .map((r) => `<li style="margin-bottom:4px;">${escapeHtml(r)}</li>`)
    .join("");

  const eventDayNote = data.hasEventDayRewards
    ? `<p style="margin:0 0 24px;font-size:14px;color:#333;line-height:1.5;">${escapeHtml(l.delayedRewardsEventDayNote)}</p>`
    : "";

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
              <h1 style="margin:0;color:#ffd700;font-size:20px;font-weight:700;">${escapeHtml(l.eventName)}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#0a1628;">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 24px;font-size:16px;color:#0a1628;line-height:1.5;">${escapeHtml(intro)}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;background-color:#f9f9f9;font-size:14px;color:#666;">${escapeHtml(l.participantIdLabel)}</td>
                  <td style="padding:12px 16px;background-color:#f9f9f9;font-size:14px;font-weight:600;color:#0a1628;">${escapeHtml(data.participantId)}</td>
                </tr>
              </table>

              <div style="margin-bottom:24px;padding:16px;background-color:#fff8e1;border-radius:6px;border:2px solid #d4a012;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#0a1628;">${escapeHtml(l.delayedRewardsListHeading)}</h2>
                <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#0a1628;">
                  ${delayedList}
                </ul>
                <p style="margin:0 0 12px;font-size:14px;color:#333;line-height:1.5;">${escapeHtml(l.delayedRewardsPromise)}</p>
                <p style="margin:0;font-size:14px;color:#333;line-height:1.5;">${escapeHtml(l.delayedRewardsContactBody)} <a href="mailto:${COLLECTION_EMAIL}" style="color:#0057b8;text-decoration:underline;">${COLLECTION_EMAIL}</a>.</p>
              </div>

              ${eventDayNote}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f5f2eb;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#666;">${escapeHtml(l.delayedRewardsFooter)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    greeting,
    "",
    intro,
    "",
    `${l.participantIdLabel}: ${data.participantId}`,
    "",
    l.delayedRewardsListHeading,
    formatTextList(delayedRewards),
    "",
    l.delayedRewardsPromise,
    `${l.delayedRewardsContactBody} ${COLLECTION_EMAIL}.`,
    "",
    ...(data.hasEventDayRewards ? [l.delayedRewardsEventDayNote, ""] : []),
    l.delayedRewardsFooter,
  ].join("\n");

  return { subject, html, text };
}

const CLOSING_PHOTOS_URL =
  "https://drive.google.com/drive/folders/1BHGxjFwjSv7HCKGnIjkMB6qYa0lro-FI?usp=sharing";
const CLOSING_CAFE_MAP_URL = "https://maps.app.goo.gl/jnCVkTWMtq214hoW8";
const CLOSING_OLENA_EMAIL = "olena.kuzhym@european-resolve.org";
const CLOSING_DARYNA_INSTAGRAM_URL = "https://www.instagram.com/daryna_omarova";
const CLOSING_WHATSAPP_URL =
  "https://chat.whatsapp.com/HwgbmEAUqWs71N6CwJ6c3I?s=cl&p=a&ilr=1";
const CLOSING_INSTAGRAM_BXL_URL = "https://www.instagram.com/bxlrun4ukraine";
const CLOSING_EVENTS_URL = "https://european-resolve.org/events";
const CLOSING_UV_RC_URL = "https://uv-rc.org/projects";
const CLOSING_HURKIT_URL = "https://hurkit.org";

export const CLOSING_DEFAULT_WINNING_TICKETS = `• Blue Ticket 45 - Irina Belan's book
• Blue Ticket 70 - Session with Lyudmila Sysoeva (women's circle)
• Blue Ticket 71 - 3-month membership Kyiv Independent
• Blue Ticket 74 - Diana skin art
• Blue Ticket 85 - Sushi Avenue Box
• Blue Ticket 231 - Sushi Avenue Box`;

export interface ClosingEmailData {
  name: string;
  email: string;
  /** Winning raffle ticket numbers and colours (preformatted, one per line). */
  winningTickets?: string;
  /** Cataldo's contact details (email, phone, etc.). */
  cataldoContact: string;
}

export function renderClosingEmail(
  data: ClosingEmailData,
  localeCode: string,
): RenderedEmail {
  const l = getEmailLocale(localeCode);
  const winningTickets = data.winningTickets ?? CLOSING_DEFAULT_WINNING_TICKETS;
  const params = {
    name: data.name,
    cataldoContact: data.cataldoContact,
  };

  const subject = interpolate(l.closingSubject, params);
  const greeting = interpolate(l.greeting, params);
  const raffleClaimBody = interpolate(l.closingRaffleClaimBody, params);

  const linkStyle =
    'color:#0057b8;text-decoration:underline;word-break:break-all;';
  const h2Style = 'margin:0 0 12px;font-size:16px;color:#0a1628;';
  const pStyle = 'margin:0 0 16px;font-size:14px;color:#333;line-height:1.5;';
  const ulStyle =
    'margin:0 0 16px;padding-left:20px;font-size:14px;color:#0a1628;';

  const introHtml = `<p style="${pStyle}">${escapeHtml(greeting)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingIntroLead)} — <strong>European Resolve</strong>, <strong>Ukrainian Voices</strong>, and the <strong>Embassy of Ukraine to the Kingdom of Belgium</strong> — ${escapeHtml(l.closingIntroThankYou)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingIntroEventContext)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingIntroHeartfelt)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingIntroVolunteers)}</p>`;

  const achievementsHtml = `<h2 style="${h2Style}">${escapeHtml(l.closingAchievementsHeading)}</h2>
              <ul style="${ulStyle}">
                <li style="margin-bottom:4px;">${escapeHtml(l.closingAchievementRunners)}</li>
                <li style="margin-bottom:4px;">${escapeHtml(l.closingAchievementDonors)}</li>
                <li style="margin-bottom:4px;">${escapeHtml(l.closingAchievementAmount)}</li>
              </ul>
              <p style="${pStyle}">${escapeHtml(l.closingCommunityThanks)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingFollowUpBody)}</p>`;

  const photosHtml = `<h2 style="${h2Style}">${escapeHtml(l.closingPhotosHeading)}</h2>
              <p style="${pStyle}">${escapeHtml(l.closingPhotosBodyBefore)} <a href="${CLOSING_PHOTOS_URL}" style="${linkStyle}">${escapeHtml(CLOSING_PHOTOS_URL)}</a>.</p>
              <p style="${pStyle}">${escapeHtml(l.closingPhotosCredit)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingPhotosShareNote)}</p>`;

  const merchHtml = `<h2 style="${h2Style}">${escapeHtml(l.closingMerchHeading)}</h2>
              <p style="${pStyle}">${escapeHtml(l.closingMerchPickupIntro)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingMerchPickupAt)} <a href="${CLOSING_CAFE_MAP_URL}" style="${linkStyle}">${escapeHtml(CLOSING_CAFE_MAP_URL)}</a></p>
              <ul style="${ulStyle}">
                <li style="margin-bottom:4px;">${escapeHtml(l.closingMerchPickupSaturday)}</li>
                <li style="margin-bottom:4px;">${escapeHtml(l.closingMerchPickupFollowing)}</li>
              </ul>
              <p style="${pStyle}">${escapeHtml(l.closingMerchCafeFood)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingMerchContactBody)} (<a href="mailto:${CLOSING_OLENA_EMAIL}" style="${linkStyle}">${CLOSING_OLENA_EMAIL}</a>).</p>
              <p style="${pStyle}">${escapeHtml(l.closingMerchItemsIntro)}</p>
              <ul style="${ulStyle}">
                <li style="margin-bottom:4px;">${escapeHtml(l.closingMerchItemSocks)}</li>
                <li style="margin-bottom:4px;">${escapeHtml(l.closingMerchItemTShirt)}</li>
                <li style="margin-bottom:4px;">${escapeHtml(l.closingMerchItemRunningTShirt)}</li>
                <li style="margin-bottom:4px;">${escapeHtml(l.closingMerchItemScarves)}</li>
              </ul>`;

  const winningTicketsHtml = escapeHtml(winningTickets).replaceAll(
    "\n",
    "<br>",
  );

  const raffleHtml = `<h2 style="${h2Style}">${escapeHtml(l.closingRaffleHeading)}</h2>
              <p style="${pStyle}">${escapeHtml(l.closingRaffleIntro)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingRaffleSponsorsThanks)}</p>
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0a1628;">${escapeHtml(l.closingRaffleWinningTicketsHeading)}</p>
              <div style="margin:0 0 16px;padding:16px;background-color:#f9f9f9;border-left:4px solid #0057b8;border-radius:4px;font-size:14px;color:#0a1628;line-height:1.6;white-space:pre-wrap;">${winningTicketsHtml}</div>
              <p style="${pStyle}">${escapeHtml(raffleClaimBody)}</p>`;

  const warmupHtml = `<h2 style="${h2Style}">${escapeHtml(l.closingWarmupThanksHeading)}</h2>
              <p style="${pStyle}">${escapeHtml(l.closingWarmupThanksBefore)} <a href="${CLOSING_DARYNA_INSTAGRAM_URL}" style="${linkStyle}">Daryna Omarova</a>${escapeHtml(l.closingWarmupThanksAfter)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingTeamThanks)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingParticipantThanks)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingUafThanks)}</p>`;

  const stayInvolvedHtml = `<h2 style="${h2Style}">${escapeHtml(l.closingStayInvolvedHeading)}</h2>
              <p style="${pStyle}">${escapeHtml(l.closingStayInvolvedRunningClubBefore)} <a href="${CLOSING_WHATSAPP_URL}" style="${linkStyle}">WhatsApp chat</a> ${escapeHtml(l.closingStayInvolvedRunningClubMid)} <a href="${CLOSING_INSTAGRAM_BXL_URL}" style="${linkStyle}">@bxlrun4ukraine</a> ${escapeHtml(l.closingStayInvolvedRunningClubAfter)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingStayInvolvedEuropeanResolveBefore)} <a href="${CLOSING_EVENTS_URL}" style="${linkStyle}">european-resolve.org/events</a>${escapeHtml(l.closingStayInvolvedEuropeanResolveAfter)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingStayInvolvedUvRcBefore)} <a href="${CLOSING_UV_RC_URL}" style="${linkStyle}">uv-rc.org/projects</a>${escapeHtml(l.closingStayInvolvedUvRcAfter)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingStayInvolvedHurkitBefore)} <a href="${CLOSING_HURKIT_URL}" style="${linkStyle}">hurkit.org</a>${escapeHtml(l.closingStayInvolvedHurkitAfter)}</p>`;

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
              <h1 style="margin:0;color:#ffd700;font-size:20px;font-weight:700;">${escapeHtml(l.eventName)}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${introHtml}
              ${achievementsHtml}
              ${photosHtml}
              ${merchHtml}
              ${raffleHtml}
              ${warmupHtml}
              ${stayInvolvedHtml}
              <p style="${pStyle}">${escapeHtml(l.closingSignOff)}</p>
              <p style="${pStyle}">${escapeHtml(l.closingSignOffClosing)}</p>
              <p style="margin:0;font-size:16px;color:#0a1628;font-weight:600;">${escapeHtml(l.closingGloryUkraine)}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f5f2eb;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#666;">${escapeHtml(l.closingFooter)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    greeting,
    "",
    `${l.closingIntroLead} — European Resolve, Ukrainian Voices, and the Embassy of Ukraine to the Kingdom of Belgium — ${l.closingIntroThankYou}`,
    "",
    l.closingIntroEventContext,
    "",
    l.closingIntroHeartfelt,
    "",
    l.closingIntroVolunteers,
    "",
    l.closingAchievementsHeading,
    `- ${l.closingAchievementRunners}`,
    `- ${l.closingAchievementDonors}`,
    `- ${l.closingAchievementAmount}`,
    "",
    l.closingCommunityThanks,
    "",
    l.closingFollowUpBody,
    "",
    l.closingPhotosHeading,
    `${l.closingPhotosBodyBefore} ${CLOSING_PHOTOS_URL}`,
    "",
    l.closingPhotosCredit,
    "",
    l.closingPhotosShareNote,
    "",
    l.closingMerchHeading,
    l.closingMerchPickupIntro,
    `${l.closingMerchPickupAt} ${CLOSING_CAFE_MAP_URL}`,
    `- ${l.closingMerchPickupSaturday}`,
    `- ${l.closingMerchPickupFollowing}`,
    "",
    l.closingMerchCafeFood,
    "",
    `${l.closingMerchContactBody} (${CLOSING_OLENA_EMAIL}).`,
    "",
    l.closingMerchItemsIntro,
    `- ${l.closingMerchItemSocks}`,
    `- ${l.closingMerchItemTShirt}`,
    `- ${l.closingMerchItemRunningTShirt}`,
    `- ${l.closingMerchItemScarves}`,
    "",
    l.closingRaffleHeading,
    l.closingRaffleIntro,
    "",
    l.closingRaffleSponsorsThanks,
    "",
    l.closingRaffleWinningTicketsHeading,
    winningTickets,
    "",
    raffleClaimBody,
    "",
    l.closingWarmupThanksHeading,
    `${l.closingWarmupThanksBefore} Daryna Omarova (${CLOSING_DARYNA_INSTAGRAM_URL})${l.closingWarmupThanksAfter}`,
    "",
    l.closingTeamThanks,
    "",
    l.closingParticipantThanks,
    "",
    l.closingUafThanks,
    "",
    l.closingStayInvolvedHeading,
    `${l.closingStayInvolvedRunningClubBefore} WhatsApp chat ${l.closingStayInvolvedRunningClubMid} @bxlrun4ukraine ${l.closingStayInvolvedRunningClubAfter} (${CLOSING_WHATSAPP_URL}, ${CLOSING_INSTAGRAM_BXL_URL})`,
    `${l.closingStayInvolvedEuropeanResolveBefore} european-resolve.org/events${l.closingStayInvolvedEuropeanResolveAfter} (${CLOSING_EVENTS_URL})`,
    `${l.closingStayInvolvedUvRcBefore} uv-rc.org/projects${l.closingStayInvolvedUvRcAfter} (${CLOSING_UV_RC_URL})`,
    `${l.closingStayInvolvedHurkitBefore} hurkit.org${l.closingStayInvolvedHurkitAfter} (${CLOSING_HURKIT_URL})`,
    "",
    l.closingSignOff,
    "",
    l.closingSignOffClosing,
    "",
    l.closingGloryUkraine,
    "",
    l.closingFooter,
  ].join("\n");

  return { subject, html, text };
}

function hasPhysicalRewards(rewards: string[]): boolean {
  // Runner tiers list "Running" plus at least one other reward; supporter/donor do not.
  return rewards.length >= 2;
}

function renderPhysicalRewardsNoticeHtml(
  l: EmailLocale,
  rewards: string[],
): string {
  if (!hasPhysicalRewards(rewards)) {
    return "";
  }

  return `<div style="margin:0 0 16px;padding:16px;background-color:#fff8e1;border-radius:6px;border:2px solid #d4a012;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0a1628;">${escapeHtml(l.physicalRewardsNoticeHeading)}</p>
                <p style="margin:0;font-size:13px;color:#333;line-height:1.5;">${escapeHtml(l.physicalRewardsNoticeBody)} <a href="mailto:${COLLECTION_EMAIL}" style="color:#0057b8;text-decoration:underline;">${COLLECTION_EMAIL}</a>.</p>
              </div>`;
}

function formatPhysicalRewardsNoticeText(
  l: EmailLocale,
  rewards: string[],
): string[] {
  if (!hasPhysicalRewards(rewards)) {
    return [];
  }

  return [
    l.physicalRewardsNoticeHeading,
    `${l.physicalRewardsNoticeBody} ${COLLECTION_EMAIL}.`,
    "",
  ];
}

function formatTextList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
