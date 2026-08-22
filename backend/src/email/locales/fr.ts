import type { EmailLocale } from "./types.js";

export const fr: EmailLocale = {
  eventName: "Run for Ukraine",
  subject:
    "Run for Ukraine | Inscription confirmée !",
  greeting: "Bonjour {name},",
  confirmationIntro:
    "Votre inscription à Run for Ukraine est confirmée. Voici vos détails :",
  participantIdLabel: "Numéro de participant",
  tierLabel: "Formule",
  amountLabel: "Montant",
  rewardsLabel: "Vos récompenses",
  rewardsLabelPending: "Votre formule sélectionnée comprend",
  rewardsDisclaimer:
    "Les récompenses finales dépendent du montant de votre don.",
  physicalRewardsNoticeHeading: "Récompenses physiques : délai de remise",
  physicalRewardsNoticeBody:
    "Notre stock d'autocollants, de chaussettes, de t-shirts et de foulards est actuellement épuisé. Vos récompenses seront fournies à l'arrivée de notre prochaine commande. Les tickets de tombola et le repas ukrainien sont disponibles sur place. Pour coordonner la remise des récompenses physiques, écrivez à",
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
    "Cet e-mail a été envoyé par European Resolve VZW pour confirmer votre inscription à Run for Ukraine.",
  footerUnsubscribe:
    "Vous recevez ce message car vous vous êtes inscrit(e) à l'événement. Aucun autre e-mail ne sera envoyé sauf si vous avez accepté les communications.",
  footerPaymentEmail:
    "Vous recevrez un dernier e-mail lorsque votre paiement sera confirmé.",
  fundraiserSubject:
    "Run for Ukraine | Votre page de collecte est en ligne !",
  fundraiserIntro:
    "Bonne nouvelle, {name} ! Vous êtes inscrit(e) ET votre page de collecte personnelle est en ligne. Partagez-la avec vos proches pour atteindre votre objectif.",
  fundraiserHeading: "Votre page de collecte",
  fundraiserPageLabel: "Partagez ce lien",
  fundraiserEditLabel: "Modifier votre page",
  fundraiserEditHint:
    "Conservez ce lien. C'est le seul moyen de modifier votre page de collecte. Ne le partagez pas publiquement.",
  fundraiserDisplayNameLabel: "Nom affiché",
  fundraiserGoalLabel: "Objectif personnel",
  paymentSubject:
    "Run for Ukraine | Paiement confirmé !",
  paymentIntro:
    "Votre don a été reçu. Voici les informations sur votre paiement :",
  paymentRewardsLabel: "Vos récompenses",
  paymentThankYou:
    "Merci de soutenir les défenseurs de l'Ukraine ! Chaque euro finance des stations de recharge sur le front.",
  paymentFooter:
    "Ceci est votre reçu de paiement d'European Resolve VZW pour Run for Ukraine.",
  tierRewards: {
    donor: "Merci de soutenir les défenseurs de l'Ukraine",
    supporter: "Découvrez l'impact de votre don",
    sprinter: "Course · Pack d'autocollants",
    "relay-runner":
      "Course · Pack d'autocollants · Chaussettes de course · 1 ticket de tombola",
    marathoner:
      "Course · T-shirt · Pack d'autocollants · Repas traditionnel ukrainien · 3 tickets de tombola",
    ultramarathoner:
      "Course · Pack d'autocollants · Foulard en soie d'une marque de créateur ukrainienne · Repas traditionnel ukrainien · 5 tickets de tombola",
  },
};
