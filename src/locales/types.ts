export interface Locale {
  // hero.* — EventHero
  "hero.overline": string;
  "hero.title": string;
  "hero.description": string;
  "hero.readMore": string;
  "hero.whyHeading": string;
  "hero.whyBody": string;
  "hero.scheduleHeading": string;
  "hero.scheduleIntro": string;
  "hero.scheduleGathering": string;
  "hero.scheduleFlag": string;
  "hero.scheduleRun": string;
  "hero.scheduleAfter": string;
  "hero.scheduleOrganisers": string;
  "hero.participateHeading": string;
  "hero.participateBody": string;
  "hero.updatesHeading": string;
  "hero.updatesBodyBefore": string;
  "hero.updatesBodyAfter": string;
  "hero.facebookEventLink": string;
  "hero.notesHeading": string;
  "hero.notesBody": string;
  "hero.closing": string;
  "hero.beneficiary": string;

  // tracks.* — TrackCards
  "tracks.heading": string;
  "tracks.subtitle": string;
  "tracks.trackAOverline": string;
  "tracks.trackATitle": string;
  "tracks.trackADescription": string;
  "tracks.trackAFeatures": string;
  "tracks.trackACta": string;
  "tracks.trackBOverline": string;
  "tracks.trackBTitle": string;
  "tracks.trackBDescription": string;
  "tracks.trackBFeatures": string;
  "tracks.trackBCta": string;

  // progress.* — ProgressSection
  "progress.overline": string;
  "progress.indicator": string;
  "progress.raised": string;
  "progress.goal": string;
  "progress.participants": string;
  "progress.donors": string;
  "progress.barLabel": string;
  "progress.finalResults": string;

  // register.* — Registration page, RegistrationForm, ConfirmationPanel
  "register.overline": string;
  "register.title": string;
  "register.titleRegistration": string;
  "register.titleConfirmation": string;
  "register.changeTier": string;
  "register.subtitle": string;
  "register.heading": string;
  "register.descriptionSupporter": string;
  "register.descriptionRunner": string;
  "register.errorSummary": string;
  "register.firstName": string;
  "register.lastName": string;
  "register.email": string;
  "register.tshirtSize": string;
  "register.socksSize": string;
  "register.gdprHeading": string;
  "register.gdprRunner": string;
  "register.gdprSupporter": string;
  "register.commsHeading": string;
  "register.commsText": string;
  "register.continue": string;
  "register.submitting": string;
  "register.failedFallback": string;
  "register.networkError": string;
  "register.errorFirstName": string;
  "register.errorLastName": string;
  "register.errorEmail": string;
  "register.errorTshirt": string;
  "register.errorSocks": string;
  "register.errorGdpr": string;
  "register.confirmHeading": string;
  "register.confirmParticipantId": string;
  "register.confirmName": string;
  "register.confirmTier": string;
  "register.confirmAmount": string;
  "register.confirmRewardsHeading": string;
  "register.confirmDonationHeading": string;
  "register.confirmDonationInstructions": string;
  "register.confirmAfterDonation": string;
  "register.confirmButton": string;
  "register.confirmingPayment": string;
  "register.confirmedHeading": string;
  "register.confirmedRunner": string;
  "register.confirmedSupporter": string;
  "register.confirmFailed": string;
  "register.confirmNetworkError": string;
  "register.interruptedSession": string;
  "register.verifyingPayment": string;
  "paymentForm.loading": string;
  "register.needInvoice": string;
  "register.startOver": string;
  "register.abandonRegistration": string;
  "register.alreadyPaidHeading": string;
  "register.alreadyPaidMessage": string;
  "register.alreadyPaidCta": string;
  "register.paymentReceivedHeading": string;
  "register.paymentReceivedMessage": string;
  "register.stockWarningHeading": string;
  "register.stockWarningBody": string;

  // tierCard.* — TierCard
  "tierCard.badge": string;
  "tierCard.selected": string;
  "tierCard.select": string;
  "tierCard.tagline.supporter": string;
  "tierCard.tagline.sprinter": string;
  "tierCard.tagline.relay-runner": string;
  "tierCard.tagline.marathoner": string;
  "tierCard.tagline.ultramarathoner": string;
  /** "·"-separated reward list, split at render time. */
  "tierCard.rewards.supporter": string;
  "tierCard.rewards.sprinter": string;
  "tierCard.rewards.relay-runner": string;
  "tierCard.rewards.marathoner": string;
  "tierCard.rewards.ultramarathoner": string;

  // fundraise.* — Fundraise page, FundraiseForm wizard
  "fundraise.overline": string;
  "fundraise.title": string;
  "fundraise.subtitle": string;
  "fundraise.step1": string;
  "fundraise.step2": string;
  "fundraise.step3": string;
  "fundraise.step1Heading": string;
  "fundraise.photoLabel": string;
  "fundraise.displayName": string;
  "fundraise.displayNamePlaceholder": string;
  "fundraise.personalMessage": string;
  "fundraise.messagePlaceholder": string;
  "fundraise.goalLabel": string;
  "fundraise.nextRunner": string;
  "fundraise.step2Heading": string;
  "fundraise.firstName": string;
  "fundraise.lastName": string;
  "fundraise.email": string;
  "fundraise.phone": string;
  "fundraise.tshirtSize": string;
  "fundraise.language": string;
  "fundraise.country": string;
  "fundraise.gdprHeading": string;
  "fundraise.gdprText": string;
  "fundraise.commsHeading": string;
  "fundraise.commsText": string;
  "fundraise.back": string;
  "fundraise.nextReview": string;
  "fundraise.step3Heading": string;
  "fundraise.reviewPage": string;
  "fundraise.reviewDisplayName": string;
  "fundraise.reviewMessage": string;
  "fundraise.reviewGoal": string;
  "fundraise.reviewPhoto": string;
  "fundraise.reviewUploaded": string;
  "fundraise.reviewNone": string;
  "fundraise.reviewRegistration": string;
  "fundraise.reviewTier": string;
  "fundraise.reviewFullName": string;
  "fundraise.reviewEmail": string;
  "fundraise.reviewTshirt": string;
  "fundraise.reviewCountry": string;
  "fundraise.submitButton": string;
  "fundraise.submitting": string;
  "fundraise.networkError": string;
  "fundraise.globalError": string;
  "fundraise.errorDisplayName": string;
  "fundraise.errorMessageRequired": string;
  "fundraise.errorMessageLength": string;
  "fundraise.errorGoal": string;
  "fundraise.errorTier": string;
  "fundraise.errorFirstName": string;
  "fundraise.errorLastName": string;
  "fundraise.errorEmail": string;
  "fundraise.errorCountry": string;
  "fundraise.errorGdpr": string;
  "fundraise.errorPhoto": string;
  "fundraise.errorPhotoType": string;

  // confirmation.* — FundraiserConfirmation
  "confirmation.heading": string;
  "confirmation.subheading": string;
  "confirmation.shareableLink": string;
  "confirmation.copy": string;
  "confirmation.copied": string;
  "confirmation.editLink": string;
  "confirmation.editHint": string;
  "confirmation.registrationHeading": string;
  "confirmation.participantId": string;
  "confirmation.tier": string;
  "confirmation.amount": string;
  "confirmation.rewardsHeading": string;
  "confirmation.paymentHeading": string;
  "confirmation.paymentInstructions": string;
  "confirmation.afterDonation": string;
  "confirmation.confirmButton": string;
  "confirmation.confirming": string;
  "confirmation.confirmed": string;
  "confirmation.confirmError": string;
  "confirmation.confirmFailed": string;
  "confirmation.interruptedSession": string;
  "confirmation.verifyingPayment": string;
  "confirmation.viewPage": string;
  "confirmation.shareHeading": string;

  // fundraiser.* — FundraiserPage
  "fundraiser.notFoundHeading": string;
  "fundraiser.notFoundText": string;
  "fundraiser.createOwn": string;
  "fundraiser.draftBanner": string;
  "fundraiser.nameSuffix": string;
  "fundraiser.personalGoal": string;
  "fundraiser.raisedSoFar": string;
  "fundraiser.collectiveTotal": string;
  "fundraiser.donateHeading": string;
  "fundraiser.shareHeading": string;
  "fundraiser.ctaButton": string;
  "fundraiser.thankYouDonation": string;
  "fundraiser.manualConfirm": string;
  "fundraiser.publishing": string;
  "fundraiser.publish": string;
  "fundraiser.edit": string;
  "fundraiser.editMessage": string;
  "fundraiser.editGoal": string;
  "fundraiser.save": string;
  "fundraiser.saving": string;
  "fundraiser.saveFailed": string;
  "fundraiser.cancel": string;

  // donorWall.* — DonorWall, DonorWallForm
  "donorWall.heading": string;
  "donorWall.empty": string;
  "donorWall.loading": string;
  "donorWall.gateButton": string;
  "donorWall.nameLabel": string;
  "donorWall.namePlaceholder": string;
  "donorWall.messageLabel": string;
  "donorWall.messagePlaceholder": string;
  "donorWall.posting": string;
  "donorWall.postButton": string;
  "donorWall.thankYou": string;
  "donorWall.privacyNotice": string;
  "donorWall.errorName": string;
  "donorWall.errorMessage": string;
  "donorWall.networkError": string;
  "donorWall.globalError": string;

  // event.* — Landing page, CoOrganiserBar
  "event.coOrganisers": string;

  // social.* — SocialShareButtons
  "social.shareWhatsApp": string;
  "social.shareLinkedIn": string;
  "social.shareFacebook": string;
  "social.shareX": string;
  "social.shareEmail": string;
  "social.copyLink": string;
  "social.shareMessage": string;

  // common.* — Shared strings
  "common.loading": string;
  "common.charCount": string;
  "common.optional": string;

  // closed.* — Post-event mode
  "closed.eventCompleted": string;
  "closed.thankYou": string;
  "closed.registrationClosed": string;
  "closed.fundraiseClosed": string;
  "closed.seeResults": string;
  "closed.donationsClosed": string;
  "closed.finalResults": string;
  "closed.galleryHeading": string;
  "closed.accountabilityHeading": string;
  "closed.totalRaised": string;
  "closed.chargingStations": string;
  "closed.impactStatement": string;
  "closed.impactUpdatePending": string;

  // errors.* — Backend error code mappings
  "errors.VALIDATION_FIRSTNAME_REQUIRED": string;
  "errors.VALIDATION_LASTNAME_REQUIRED": string;
  "errors.VALIDATION_EMAIL_INVALID": string;
  "errors.VALIDATION_TSHIRT_INVALID": string;
  "errors.VALIDATION_SOCKS_INVALID": string;
  "errors.VALIDATION_LANGUAGE_INVALID": string;
  "errors.VALIDATION_COUNTRY_REQUIRED": string;
  "errors.VALIDATION_TIER_INVALID": string;
  "errors.VALIDATION_GDPR_REQUIRED": string;
  "errors.VALIDATION_PARTICIPATION_TYPE_REQUIRED": string;
  "errors.VALIDATION_DISPLAYNAME_LENGTH": string;
  "errors.VALIDATION_MESSAGE_REQUIRED": string;
  "errors.VALIDATION_MESSAGE_LENGTH": string;
  "errors.VALIDATION_GOAL_INVALID": string;
  "errors.VALIDATION_PHOTO_TYPE": string;
  "errors.VALIDATION_PHOTO_SIZE": string;
  "errors.VALIDATION_STATUS_INVALID": string;
  "errors.VALIDATION_AUTH_REQUIRED": string;
  "errors.VALIDATION_AUTH_INVALID": string;
  "errors.VALIDATION_DONOR_NAME_LENGTH": string;
  "errors.VALIDATION_DONOR_MESSAGE_LENGTH": string;
  "errors.VALIDATION_SLUG_REQUIRED": string;
  "errors.VALIDATION_SLUG_NOT_FOUND": string;
  "errors.INTERNAL_ERROR": string;

  // nav.* — Breadcrumb labels
  "nav.events": string;
  "nav.register": string;
  "nav.fundraise": string;
  "nav.fundraiser": string;

  // feeBreakdown.* — FeeBreakdownBar
  "feeBreakdown.overline": string;
  "feeBreakdown.cause": string;
  "feeBreakdown.logistics": string;
}
