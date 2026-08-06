import type { EmailLocale } from "./types.js";

export const fr: EmailLocale = {
  subject: "35 Years of 🇺🇦 Independence: Charity and Run | Inscription confirmée !",
  greeting: "Bonjour {name},",
  confirmationIntro:
    "Votre inscription à 35 Years of 🇺🇦 Independence: Charity and Run est confirmée. Voici vos détails :",
  participantIdLabel: "Numéro de participant",
  tierLabel: "Formule",
  amountLabel: "Montant",
  rewardsLabel: "Vos récompenses",
  rewardsLabelPending: "Votre formule sélectionnée comprend",
  rewardsDisclaimer:
    "Les récompenses finales dépendent du montant de votre don.",
  donationHeading: "Complétez votre don",
  alreadyPaidNotice:
    "Si vous avez déjà payé, nous vous enverrons le reçu dès que votre paiement sera traité.",
  donationInstructions:
    "Pour finaliser votre inscription {tierName}, veuillez effectuer votre don de €{amount} via le lien ci-dessous.",
  donationButton: "Donner €{amount}",
  eventDetailsHeading: "Détails de l'événement",
  eventDate: "23 août 2026, 10:00",
  eventLocation: "Place du Luxembourg, Bruxelles, Belgique",
  footerText:
    "Cet e-mail a été envoyé par European Resolve VZW pour confirmer votre inscription à 35 Years of 🇺🇦 Independence: Charity and Run.",
  footerUnsubscribe:
    "Vous recevez ce message car vous vous êtes inscrit(e) à l'événement. Aucun autre e-mail ne sera envoyé sauf si vous avez accepté les communications.",
  footerPaymentEmail:
    "Vous recevrez un dernier e-mail lorsque votre paiement sera confirmé.",
  fundraiserSubject:
    "35 Years of 🇺🇦 Independence: Charity and Run | Votre page de collecte est en ligne !",
  fundraiserIntro:
    "Bonne nouvelle, {name} ! Vous êtes inscrit(e) ET votre page de collecte personnelle est en ligne. Partagez-la avec vos proches pour atteindre votre objectif.",
  fundraiserHeading: "Votre page de collecte",
  fundraiserPageLabel: "Partagez ce lien",
  fundraiserEditLabel: "Modifier votre page",
  fundraiserEditHint:
    "Conservez ce lien. C'est le seul moyen de modifier votre page de collecte. Ne le partagez pas publiquement.",
  fundraiserDisplayNameLabel: "Nom affiché",
  fundraiserGoalLabel: "Objectif personnel",
  paymentSubject: "35 Years of 🇺🇦 Independence: Charity and Run | Paiement confirmé !",
  paymentIntro:
    "Votre don a été reçu. Voici votre inscription confirmée :",
  paymentRewardsLabel: "Vos récompenses",
  paymentThankYou:
    "Merci de soutenir les défenseurs de l'Ukraine ! Chaque euro finance des stations de recharge sur le front.",
  paymentFooter:
    "Ceci est votre reçu de paiement d'European Resolve VZW pour 35 Years of 🇺🇦 Independence: Charity and Run.",
  tierRewards: {
    supporter: { base: "Découvrez l'impact de votre don", runnerOnly: "" },
    sprinter: { base: "Pack d'autocollants", runnerOnly: "Course" },
    "relay-runner": {
      base: "Pack d'autocollants · Chaussettes de course · 1 ticket de tombola",
      runnerOnly: "Course",
    },
    marathoner: {
      base: "Pack d'autocollants · Repas traditionnel ukrainien · 3 tickets de tombola",
      runnerOnly: "Course · T-shirt de course",
    },
    ultramarathoner: {
      base: "Pack d'autocollants · Foulard en soie d'une marque de créateur ukrainienne · Repas traditionnel ukrainien · 5 tickets de tombola",
      runnerOnly: "Course",
    },
  },
};
