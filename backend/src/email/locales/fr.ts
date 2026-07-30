import type { EmailLocale } from "./types.js";

export const fr: EmailLocale = {
  subject: "Run for Ukraine 2026 — Inscription confirmée !",
  greeting: "Bonjour {name},",
  confirmationIntro:
    "Votre inscription à Run for Ukraine 2026 est confirmée. Voici vos détails :",
  participantIdLabel: "Numéro de participant",
  tierLabel: "Formule",
  amountLabel: "Montant",
  rewardsLabel: "Vos récompenses",
  donationHeading: "Complétez votre don",
  donationInstructions:
    "Pour finaliser votre inscription {tierName}, veuillez effectuer votre don de €{amount} via le lien ci-dessous.",
  donationButton: "Donner €{amount}",
  eventDetailsHeading: "Détails de l'événement",
  eventDate: "23 août 2026",
  eventLocation: "Bruxelles, Belgique",
  footerText:
    "Cet e-mail a été envoyé par European Resolve VZW pour confirmer votre inscription à Run for Ukraine 2026.",
  footerUnsubscribe:
    "Vous recevez ce message car vous vous êtes inscrit(e) à l'événement. Aucun autre e-mail ne sera envoyé sauf si vous avez accepté les communications.",
};
