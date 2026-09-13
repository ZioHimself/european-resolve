import { createTransport, type Transporter } from "nodemailer";
import { config } from "../config.js";
import { LANGUAGE_TO_LOCALE, type Language } from "../types.js";
import {
  renderDeploymentUpdateEmail,
  type DeploymentUpdateEmailData,
  type RenderedEmail,
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

export async function sendDeploymentUpdateEmail(
  data: DeploymentUpdateEmailData,
  language: Language,
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    throw new Error("SMTP not configured");
  }

  const localeCode = LANGUAGE_TO_LOCALE[language] ?? "en";
  const rendered = renderDeploymentUpdateEmail(data, localeCode);

  await deliverEmail(transport, data.email, rendered);

  console.info(
    `[email] Deployment update sent to ${data.email} (locale: ${localeCode})`,
  );
}
