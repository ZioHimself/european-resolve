import type { EmailLocale } from "./types.js";

export const en: EmailLocale = {
  subject:
    "35 Years of 🇺🇦 Independence: Charity and Run | Registration confirmed!",
  greeting: "Hi {name},",
  confirmationIntro:
    "Your registration for 35 Years of 🇺🇦 Independence: Charity and Run is confirmed. Here are your details:",
  participantIdLabel: "Participant ID",
  tierLabel: "Tier",
  amountLabel: "Amount",
  rewardsLabel: "Your rewards",
  rewardsLabelPending: "Your selected tier includes",
  rewardsDisclaimer: "Final rewards are based on your donation amount.",
  donationHeading: "Complete your donation",
  alreadyPaidNotice:
    "If you have already paid, we will send you the receipt as soon as we process your payment.",
  donationInstructions:
    "To finalise your {tierName} registration, please complete your €{amount} donation using the link below.",
  donationButton: "Donate €{amount}",
  eventDetailsHeading: "Event details",
  eventDate: "23 August 2026, 10:00",
  eventLocation: "Place du Luxembourg, Brussels, Belgium",
  footerText:
    "This email was sent by European Resolve VZW as confirmation of your 35 Years of 🇺🇦 Independence: Charity and Run registration.",
  footerUnsubscribe:
    "You are receiving this because you registered for the event. No further emails will be sent unless you opted in to communications.",
  footerPaymentEmail:
    "You'll receive one more email when your payment is confirmed.",
  fundraiserSubject:
    "35 Years of 🇺🇦 Independence: Charity and Run | Your fundraiser page is live!",
  fundraiserIntro:
    "Great news, {name}! You're registered AND your personal fundraiser page is live. Share it with friends and family to help reach your goal.",
  fundraiserHeading: "Your fundraiser page",
  fundraiserPageLabel: "Share this link",
  fundraiserEditLabel: "Edit your page",
  fundraiserEditHint:
    "Save this link. It's the only way to edit your fundraiser page. Do not share it publicly.",
  fundraiserDisplayNameLabel: "Display name",
  fundraiserGoalLabel: "Personal goal",
  paymentSubject:
    "35 Years of 🇺🇦 Independence: Charity and Run | Payment confirmed!",
  paymentIntro:
    "Your donation has been received. Here's your confirmed registration:",
  paymentRewardsLabel: "Your rewards",
  paymentThankYou:
    "Thank you for supporting Ukraine's defenders! Every euro funds charging stations on the front line.",
  paymentFooter:
    "This is your payment receipt from European Resolve VZW for 35 Years of 🇺🇦 Independence: Charity and Run.",
  tierRewards: {
    supporter: { base: "Hear how your donation helped", runnerOnly: "" },
    sprinter: { base: "Sticker pack", runnerOnly: "Running" },
    "relay-runner": {
      base: "Sticker pack · Running socks · 1 raffle ticket",
      runnerOnly: "Running",
    },
    marathoner: {
      base: "Sticker pack · Traditional Ukrainian meal · 3 raffle tickets",
      runnerOnly: "Running · Running t-shirt",
    },
    ultramarathoner: {
      base: "Sticker pack · Silk scarf by a Ukrainian designer brand · Traditional Ukrainian meal · 5 raffle tickets",
      runnerOnly: "Running",
    },
  },
};
