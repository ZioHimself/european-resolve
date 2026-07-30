import type { EmailLocale } from "./types.js";

export const en: EmailLocale = {
  subject: "Run for Ukraine 2026 — Registration confirmed!",
  greeting: "Hi {name},",
  confirmationIntro:
    "Your registration for Run for Ukraine 2026 is confirmed. Here are your details:",
  participantIdLabel: "Participant ID",
  tierLabel: "Tier",
  amountLabel: "Amount",
  rewardsLabel: "Your rewards",
  donationHeading: "Complete your donation",
  donationInstructions:
    "To finalise your {tierName} registration, please complete your €{amount} donation using the link below.",
  donationButton: "Donate €{amount}",
  eventDetailsHeading: "Event details",
  eventDate: "23 August 2026",
  eventLocation: "Brussels, Belgium",
  footerText:
    "This email was sent by European Resolve VZW as confirmation of your Run for Ukraine 2026 registration.",
  footerUnsubscribe:
    "You are receiving this because you registered for the event. No further emails will be sent unless you opted in to communications.",
};
