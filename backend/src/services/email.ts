import { createTransport, type Transporter } from "nodemailer";
import { config } from "../config.js";
import { LANGUAGE_TO_LOCALE, type Language } from "../types.js";
import {
  renderConfirmationEmail,
  renderFundraiserEmail,
  renderPaymentConfirmationEmail,
  renderDelayedRewardsEmail,
  renderClosingEmail,
  type RenderedEmail,
  type RegistrationEmailData,
  type FundraiserEmailData,
  type PaymentConfirmationEmailData,
  type DelayedRewardsEmailData,
  type ClosingEmailData,
} from "../email/render.js";

let transporter: Transporter | null = null;

async function deliverEmail(
  transport: Transporter,
  to: string,
  rendered: RenderedEmail,
): Promise<void> {
  await transport.sendMail({
    from: config.smtp.from,
    replyTo: config.smtp.replyTo,
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}

function getTransporter(): Transporter | null {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    return null;
  }

  if (!transporter) {
    transporter = createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  return transporter;
}

export async function sendConfirmationEmail(
  data: RegistrationEmailData,
  language: Language,
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] SMTP not configured, skipping confirmation email");
    return;
  }

  const localeCode = LANGUAGE_TO_LOCALE[language] ?? "en";
  const rendered = renderConfirmationEmail(data, localeCode);

  await deliverEmail(transport, data.email, rendered);

  console.info(
    `[email] Confirmation sent to ${data.email} (locale: ${localeCode})`,
  );
}

export async function sendFundraiserEmail(
  data: FundraiserEmailData,
  language: Language,
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] SMTP not configured, skipping fundraiser confirmation email");
    return;
  }

  const localeCode = LANGUAGE_TO_LOCALE[language] ?? "en";
  const rendered = renderFundraiserEmail(data, localeCode);

  await deliverEmail(transport, data.email, rendered);

  console.info(
    `[email] Fundraiser confirmation sent to ${data.email} (locale: ${localeCode})`,
  );
}

export async function sendPaymentConfirmationEmail(
  data: PaymentConfirmationEmailData,
  language: Language,
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] SMTP not configured, skipping payment confirmation email");
    return;
  }

  const localeCode = LANGUAGE_TO_LOCALE[language] ?? "en";
  const rendered = renderPaymentConfirmationEmail(data, localeCode);

  await deliverEmail(transport, data.email, rendered);

  console.info(
    `[email] Payment confirmation sent to ${data.email} (locale: ${localeCode})`,
  );
}

export async function sendDelayedRewardsEmail(
  data: DelayedRewardsEmailData,
  language: Language,
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] SMTP not configured, skipping delayed rewards email");
    return;
  }

  const localeCode = LANGUAGE_TO_LOCALE[language] ?? "en";
  const rendered = renderDelayedRewardsEmail(data, localeCode);

  await deliverEmail(transport, data.email, rendered);

  console.info(
    `[email] Delayed rewards notice sent to ${data.email} (locale: ${localeCode})`,
  );
}

export async function sendClosingEmail(
  data: ClosingEmailData,
  language: Language,
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] SMTP not configured, skipping closing email");
    return;
  }

  const localeCode = LANGUAGE_TO_LOCALE[language] ?? "en";
  const rendered = renderClosingEmail(data, localeCode);

  await deliverEmail(transport, data.email, rendered);

  console.info(
    `[email] Closing email sent to ${data.email} (locale: ${localeCode})`,
  );
}
