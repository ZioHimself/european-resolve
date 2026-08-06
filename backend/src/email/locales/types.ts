import type { TierId } from "../../types.js";

export interface EmailLocale {
  subject: string;
  greeting: string;
  confirmationIntro: string;
  participantIdLabel: string;
  tierLabel: string;
  amountLabel: string;
  rewardsLabel: string;
  rewardsLabelPending: string;
  rewardsDisclaimer: string;
  donationHeading: string;
  alreadyPaidNotice: string;
  donationInstructions: string;
  donationButton: string;
  eventDetailsHeading: string;
  eventDate: string;
  eventLocation: string;
  footerText: string;
  footerUnsubscribe: string;
  footerPaymentEmail: string;
  fundraiserSubject: string;
  fundraiserIntro: string;
  fundraiserHeading: string;
  fundraiserPageLabel: string;
  fundraiserEditLabel: string;
  fundraiserEditHint: string;
  fundraiserDisplayNameLabel: string;
  fundraiserGoalLabel: string;
  paymentSubject: string;
  paymentIntro: string;
  paymentRewardsLabel: string;
  paymentThankYou: string;
  paymentFooter: string;

  /**
   * Reward list per tier, as a single "·"-separated string per field so
   * translators handle one sentence-like value instead of an array.
   * `runnerOnly` items are shown only for participationType "runner" and
   * are prepended before `base` when shown.
   */
  tierRewards: Record<TierId, { base: string; runnerOnly: string }>;
}
