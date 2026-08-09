type LogLevel = "info" | "warn" | "error";

type FlowScope =
  | "RegisterClient"
  | "RegistrationForm"
  | "WhyDonate"
  | "ConfirmationPanel"
  | "FundraiserConfirmation";

function emit(
  scope: FlowScope,
  event: string,
  data?: Record<string, unknown>,
  level: LogLevel = "info",
): void {
  if (typeof window === "undefined") return;
  const message = `[R4U:${scope}] ${event}`;
  const payload = data ?? {};
  if (level === "error") {
    console.error(message, payload);
    return;
  }
  if (level === "warn") {
    console.warn(message, payload);
    return;
  }
  console.log(message, payload);
}

/** Redact email local-part for console logs in production. */
export function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "(invalid)";
  return `***@${email.slice(at + 1)}`;
}

/** Short token prefix for correlating logs without exposing the full secret. */
export function tokenHint(token: string): string {
  return token.length > 8 ? `${token.slice(0, 8)}…` : token;
}

export const regFlowLog = {
  registerClient(event: string, data?: Record<string, unknown>) {
    emit("RegisterClient", event, data);
  },
  registerClientWarn(event: string, data?: Record<string, unknown>) {
    emit("RegisterClient", event, data, "warn");
  },
  registrationForm(event: string, data?: Record<string, unknown>) {
    emit("RegistrationForm", event, data);
  },
  registrationFormWarn(event: string, data?: Record<string, unknown>) {
    emit("RegistrationForm", event, data, "warn");
  },
  registrationFormError(event: string, data?: Record<string, unknown>) {
    emit("RegistrationForm", event, data, "error");
  },
  whyDonate(event: string, data?: Record<string, unknown>) {
    emit("WhyDonate", event, data);
  },
  whyDonateWarn(event: string, data?: Record<string, unknown>) {
    emit("WhyDonate", event, data, "warn");
  },
  confirmation(event: string, data?: Record<string, unknown>) {
    emit("ConfirmationPanel", event, data);
  },
  confirmationWarn(event: string, data?: Record<string, unknown>) {
    emit("ConfirmationPanel", event, data, "warn");
  },
  confirmationError(event: string, data?: Record<string, unknown>) {
    emit("ConfirmationPanel", event, data, "error");
  },
  fundraiserConfirmation(event: string, data?: Record<string, unknown>) {
    emit("FundraiserConfirmation", event, data);
  },
  fundraiserConfirmationWarn(event: string, data?: Record<string, unknown>) {
    emit("FundraiserConfirmation", event, data, "warn");
  },
  fundraiserConfirmationError(event: string, data?: Record<string, unknown>) {
    emit("FundraiserConfirmation", event, data, "error");
  },
};
