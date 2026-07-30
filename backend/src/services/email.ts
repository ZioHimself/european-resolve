import { createTransport, type Transporter } from "nodemailer";
import { config } from "../config.js";
import { LANGUAGE_TO_LOCALE, type Language } from "../types.js";
import {
  renderConfirmationEmail,
  renderFundraiserEmail,
  type RegistrationEmailData,
  type FundraiserEmailData,
} from "../email/render.js";

let transporter: Transporter | null = null;

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
  const { subject, html } = renderConfirmationEmail(data, localeCode);

  await transport.sendMail({
    from: config.smtp.from,
    to: data.email,
    subject,
    html,
  });

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
  const { subject, html } = renderFundraiserEmail(data, localeCode);

  await transport.sendMail({
    from: config.smtp.from,
    to: data.email,
    subject,
    html,
  });

  console.info(
    `[email] Fundraiser confirmation sent to ${data.email} (locale: ${localeCode})`,
  );
}
