import type { TierId } from "../../types.js";

export type DelayedRewardKey =
  | "running_socks"
  | "t_shirt"
  | "silk_scarf"
  | "sticker_pack";

export interface DelayedRewardLabels {
  running_socks: string;
  t_shirt: string;
  silk_scarf: string;
  sticker_pack: string;
}

export interface EmailLocale {
  /** Localized event display name (email header and copy). */
  eventName: string;
  subject: string;
  greeting: string;
  confirmationIntro: string;
  participantIdLabel: string;
  tierLabel: string;
  amountLabel: string;
  rewardsLabel: string;
  rewardsLabelPending: string;
  rewardsDisclaimer: string;
  physicalRewardsNoticeHeading: string;
  physicalRewardsNoticeBody: string;
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
  delayedRewardsSubject: string;
  delayedRewardsIntro: string;
  delayedRewardsListHeading: string;
  delayedRewardsPromise: string;
  delayedRewardsContactBody: string;
  delayedRewardsEventDayNote: string;
  delayedRewardsFooter: string;
  delayedRewardLabels: DelayedRewardLabels;

  closingSubject: string;
  closingIntroLead: string;
  closingIntroThankYou: string;
  closingIntroEventContext: string;
  closingIntroHeartfelt: string;
  closingIntroVolunteers: string;
  closingAchievementsHeading: string;
  closingAchievementRunners: string;
  closingAchievementDonors: string;
  closingAchievementAmount: string;
  closingCommunityThanks: string;
  closingFollowUpBody: string;
  closingPhotosHeading: string;
  closingPhotosBodyBefore: string;
  closingPhotosCredit: string;
  closingPhotosShareNote: string;
  closingMerchHeading: string;
  closingMerchPickupIntro: string;
  closingMerchPickupAt: string;
  closingMerchPickupSaturday: string;
  closingMerchPickupFollowing: string;
  closingMerchCafeFood: string;
  closingMerchContactBody: string;
  closingMerchItemsIntro: string;
  closingMerchItemSocks: string;
  closingMerchItemTShirt: string;
  closingMerchItemRunningTShirt: string;
  closingMerchItemScarves: string;
  closingRaffleHeading: string;
  closingRaffleIntro: string;
  closingRaffleSponsorsThanks: string;
  closingRaffleWinningTicketsHeading: string;
  closingRaffleClaimBody: string;
  closingWarmupThanksHeading: string;
  closingWarmupThanksBefore: string;
  closingWarmupThanksAfter: string;
  closingTeamThanks: string;
  closingParticipantThanks: string;
  closingUafThanks: string;
  closingStayInvolvedHeading: string;
  closingStayInvolvedRunningClubBefore: string;
  closingStayInvolvedRunningClubMid: string;
  closingStayInvolvedRunningClubAfter: string;
  closingStayInvolvedEuropeanResolveBefore: string;
  closingStayInvolvedEuropeanResolveAfter: string;
  closingStayInvolvedUvRcBefore: string;
  closingStayInvolvedUvRcAfter: string;
  closingStayInvolvedHurkitBefore: string;
  closingStayInvolvedHurkitAfter: string;
  closingSignOff: string;
  closingSignOffClosing: string;
  closingGloryUkraine: string;
  closingFooter: string;

  /** Reward list per tier, as a single "·"-separated string, split at render time. */
  tierRewards: Record<TierId, string>;
}
