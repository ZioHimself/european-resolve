import type { EmailLocale } from "./types.js";

export const en: EmailLocale = {
  eventName: "Run for Ukraine",
  subject:
    "Run for Ukraine | Registration confirmed!",
  greeting: "Hi {name},",
  confirmationIntro:
    "Your registration for Run for Ukraine is confirmed. Here are your details:",
  participantIdLabel: "Participant ID",
  tierLabel: "Tier",
  amountLabel: "Amount",
  rewardsLabel: "Your rewards",
  rewardsLabelPending: "Your selected tier includes",
  rewardsDisclaimer: "Final rewards are based on your donation amount.",
  physicalRewardsNoticeHeading: "Physical rewards: delivery delay",
  physicalRewardsNoticeBody:
    "Our stock of stickers, socks, t-shirts, and scarves is currently exhausted. Your rewards will be provided once our next order arrives. Raffle tickets and the Ukrainian meal are available at the event. To coordinate collection of physical rewards, email",
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
    "This email was sent by European Resolve VZW as confirmation of your Run for Ukraine registration.",
  footerUnsubscribe:
    "You are receiving this because you registered for the event. No further emails will be sent unless you opted in to communications.",
  footerPaymentEmail:
    "You'll receive one more email when your payment is confirmed.",
  fundraiserSubject:
    "Run for Ukraine | Your fundraiser page is live!",
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
    "Run for Ukraine | Payment confirmed!",
  paymentIntro:
    "Your donation has been received. Here's the information about your payment:",
  paymentRewardsLabel: "Your rewards",
  paymentThankYou:
    "Thank you for supporting Ukraine's defenders! Every euro funds charging stations on the front line.",
  paymentFooter:
    "This is your payment receipt from European Resolve VZW for Run for Ukraine.",
  delayedRewardsSubject: "Run for Ukraine | Update on your rewards",
  delayedRewardsIntro:
    "Thank you for joining Run for Ukraine and for your generous donation. We owe you an apology: our physical reward stock ran out before your payment was confirmed, so we cannot hand out the items below on event day.",
  delayedRewardsListHeading: "Not available on event day",
  delayedRewardsPromise:
    "We have placed a second order. We will provide these rewards as soon as it arrives.",
  delayedRewardsContactBody:
    "To coordinate collection once your rewards are ready, email",
  delayedRewardsEventDayNote:
    "Other rewards from your tier will still be available at the event, including raffle tickets and, where your tier includes it, the traditional Ukrainian meal.",
  delayedRewardsFooter:
    "This email was sent by European Resolve VZW regarding your Run for Ukraine registration.",
  delayedRewardLabels: {
    running_socks: "Running socks",
    t_shirt: "T-shirt",
    silk_scarf: "Silk scarf by a Ukrainian designer brand",
    sticker_pack: "Sticker pack",
  },
  tierRewards: {
    donor: "Thank you for supporting Ukraine's defenders",
    supporter: "Hear how your donation helped",
    sprinter: "Running · Sticker pack",
    "relay-runner": "Running · Sticker pack · Running socks · 1 raffle ticket",
    marathoner:
      "Running · T-shirt · Sticker pack · Traditional Ukrainian meal · 3 raffle tickets",
    ultramarathoner:
      "Running · Sticker pack · Silk scarf by a Ukrainian designer brand · Traditional Ukrainian meal · 5 raffle tickets",
  },
};
