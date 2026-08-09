type LogLevel = "info" | "warn" | "error";

type FlowScope = "Api:Register" | "Api:ConfirmPayment" | "Api:Lookup";

function emit(
  scope: FlowScope,
  event: string,
  data?: Record<string, unknown>,
  level: LogLevel = "info",
): void {
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

/** Redact email local-part for server logs. */
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
  register(event: string, data?: Record<string, unknown>) {
    emit("Api:Register", event, data);
  },
  registerWarn(event: string, data?: Record<string, unknown>) {
    emit("Api:Register", event, data, "warn");
  },
  registerError(event: string, data?: Record<string, unknown>) {
    emit("Api:Register", event, data, "error");
  },
  confirmPayment(event: string, data?: Record<string, unknown>) {
    emit("Api:ConfirmPayment", event, data);
  },
  confirmPaymentWarn(event: string, data?: Record<string, unknown>) {
    emit("Api:ConfirmPayment", event, data, "warn");
  },
  confirmPaymentError(event: string, data?: Record<string, unknown>) {
    emit("Api:ConfirmPayment", event, data, "error");
  },
  lookup(event: string, data?: Record<string, unknown>) {
    emit("Api:Lookup", event, data);
  },
  lookupWarn(event: string, data?: Record<string, unknown>) {
    emit("Api:Lookup", event, data, "warn");
  },
};
