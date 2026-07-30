import type { Locale } from "./types";

export const en = {
  // hero
  "hero.overline": "Charity run · Brussels",
  "hero.beneficiary": "Beneficiary:",

  // tracks
  "tracks.heading": "Choose your track",
  "tracks.subtitle": "Two ways to support, one goal. Pick one\u00a0track.",
  "tracks.trackAOverline": "Track A",
  "tracks.trackATitle": "Donate or Run",
  "tracks.trackADescription":
    "Pick a tier and contribute directly — run on the day or simply support from anywhere. Your fee funds charging stations for defenders.",
  "tracks.trackAFeatures": "Race bib · Finisher medal · T-shirt",
  "tracks.trackACta": "See tiers →",
  "tracks.trackBOverline": "Track B",
  "tracks.trackBTitle": "Fundraise and Run",
  "tracks.trackBDescription":
    "Create a personal fundraising page and rally your network. Every donation counts toward the collective goal — then show up and run.",
  "tracks.trackBFeatures": "Personal page · Shareable link · Live stats",
  "tracks.trackBCta": "Create my page →",

  // progress
  "progress.overline": "Live progress",
  "progress.indicator": "Updated live",
  "progress.raised": "Raised",
  "progress.goal": "Goal",
  "progress.participants": "Participants",
  "progress.donors": "Donors",
  "progress.barLabel": "€{raised} raised · Goal €{goal}",
  "progress.finalResults": "Final results",

  // register
  "register.overline": "Track A · Donate or Run",
  "register.title": "Pick a tier",
  "register.subtitle":
    "Every tier directly funds charging stations for Ukraine's defenders. Run on the day or simply support from anywhere.",
  "register.heading": "Your details",
  "register.howParticipate": "How will you participate?",
  "register.runOnDay": "I'll run on the day",
  "register.supportAnywhere": "I'll support from anywhere",
  "register.errorSummary": "Please fix the following:",
  "register.fullName": "Full name",
  "register.email": "Email",
  "register.phone": "Phone",
  "register.tshirtSize": "T-shirt size",
  "register.language": "Language",
  "register.country": "Country",
  "register.optional": "(optional)",
  "register.gdprHeading": "GDPR consent (required)",
  "register.gdprRunner":
    "I agree to my data being processed for the purpose of race registration and safety, in line with the privacy notice.",
  "register.gdprSupporter":
    "I agree to my data being processed for the purpose of event registration and donation tracking, in line with the privacy notice.",
  "register.commsHeading": "Ongoing communications (optional)",
  "register.commsText":
    "Send me news about future editions and the beneficiary's work. I can unsubscribe at any time.",
  "register.total": "Total: €{price}",
  "register.totalEmpty": "Total: €—",
  "register.submitRunner": "Register — €{price}",
  "register.submitSupporter": "Support — €{price}",
  "register.submitting": "Registering...",
  "register.selectTier": "Select a tier to register",
  "register.failedFallback": "Registration failed. Please try again.",
  "register.networkError":
    "Could not connect to the registration server. Please try again later.",
  "register.errorFullName": "Full name is required",
  "register.errorEmail": "Valid email address is required",
  "register.errorTshirt": "T-shirt size is required",
  "register.errorCountry": "Country is required",
  "register.errorGdpr": "GDPR consent is required to register",
  "register.confirmHeading": "Registration confirmed!",
  "register.confirmParticipantId": "Your ID: {id}",
  "register.confirmName": "Name",
  "register.confirmTier": "Tier",
  "register.confirmAmount": "Amount",
  "register.confirmRewardsHeading": "Your rewards",
  "register.confirmDonationHeading": "Complete your €{amount} donation",
  "register.confirmDonationInstructions":
    "Please select the €{amount} option below to complete your {tierName} registration.",
  "register.confirmAfterDonation": "After completing your donation above:",
  "register.confirmButton": "I\u2019ve completed my donation",
  "register.confirmingPayment": "Confirming\u2026",
  "register.confirmedHeading": "Payment received — thank you!",
  "register.confirmedRunner":
    "Your registration is now complete. You'll receive your race materials at the event.",
  "register.confirmedSupporter":
    "Thank you for supporting from afar! You'll receive a digital certificate by email.",
  "register.confirmFailed": "Confirmation failed",
  "register.confirmNetworkError":
    "Could not confirm payment. Please try again.",

  // tierCard
  "tierCard.badge": "Most chosen",
  "tierCard.selected": "Selected",
  "tierCard.select": "Select",

  // fundraise
  "fundraise.overline": "Track B · Fundraise and Run",
  "fundraise.title": "Your fundraising page",
  "fundraise.subtitle":
    "Takes about a minute. Share your page with friends and family to help reach the collective goal — then show up and run.",
  "fundraise.step1": "1. Your page",
  "fundraise.step2": "2. Runner details",
  "fundraise.step3": "3. Review",
  "fundraise.step1Heading": "Set up your fundraising page",
  "fundraise.photoLabel": "+ Photo",
  "fundraise.displayName": "Display name",
  "fundraise.displayNamePlaceholder": "How you want to appear on your page",
  "fundraise.personalMessage": "Personal message",
  "fundraise.messagePlaceholder": "Why are you running? What drives you?",
  "fundraise.goalLabel": "Personal goal (€)",
  "fundraise.nextRunner": "Next: Runner details →",
  "fundraise.step2Heading": "Your runner registration",
  "fundraise.fullName": "Full name",
  "fundraise.email": "Email",
  "fundraise.phone": "Phone",
  "fundraise.tshirtSize": "T-shirt size",
  "fundraise.language": "Language",
  "fundraise.country": "Country",
  "fundraise.gdprHeading": "GDPR consent (required)",
  "fundraise.gdprText":
    "I agree to my data being processed for the purpose of race registration and safety, in line with the privacy notice.",
  "fundraise.commsHeading": "Ongoing communications (optional)",
  "fundraise.commsText":
    "Send me news about future editions and the beneficiary's work.",
  "fundraise.back": "← Back",
  "fundraise.nextReview": "Next: Review →",
  "fundraise.step3Heading": "Review and submit",
  "fundraise.reviewPage": "Your fundraising page",
  "fundraise.reviewDisplayName": "Display name",
  "fundraise.reviewMessage": "Message",
  "fundraise.reviewGoal": "Goal",
  "fundraise.reviewPhoto": "Photo",
  "fundraise.reviewUploaded": "Uploaded",
  "fundraise.reviewNone": "None",
  "fundraise.reviewRegistration": "Runner registration",
  "fundraise.reviewTier": "Tier",
  "fundraise.reviewFullName": "Full name",
  "fundraise.reviewEmail": "Email",
  "fundraise.reviewTshirt": "T-shirt",
  "fundraise.reviewCountry": "Country",
  "fundraise.submitButton": "Create page and register — €{price}",
  "fundraise.submitting": "Creating\u2026",
  "fundraise.networkError":
    "Network error. Please check your connection and try again.",
  "fundraise.globalError": "Something went wrong. Please try again.",
  "fundraise.errorDisplayName": "Display name must be 2-50 characters",
  "fundraise.errorMessageRequired": "Message is required",
  "fundraise.errorMessageLength": "Message must be under 500 characters",
  "fundraise.errorGoal":
    "Goal must be a whole number between 10 and 100,000",
  "fundraise.errorTier": "Please select a tier",
  "fundraise.errorFullName": "Full name is required",
  "fundraise.errorEmail": "Valid email address is required",
  "fundraise.errorCountry": "Country is required",
  "fundraise.errorGdpr": "GDPR consent is required to register",
  "fundraise.errorPhoto": "Photo must be under 5MB",
  "fundraise.errorPhotoType": "Photo must be JPEG, PNG, or WebP",

  // confirmation (FundraiserConfirmation)
  "confirmation.heading": "Your fundraising page is ready!",
  "confirmation.subheading":
    "Share your page with friends and family — {name}",
  "confirmation.shareableLink": "Your shareable link",
  "confirmation.copy": "Copy",
  "confirmation.copied": "Copied!",
  "confirmation.editLink": "Secret edit link — save this!",
  "confirmation.editHint":
    "This link lets you edit and publish your page. Keep it private.",
  "confirmation.registrationHeading": "Runner registration",
  "confirmation.participantId": "Your ID: {id}",
  "confirmation.tier": "Tier",
  "confirmation.amount": "Amount",
  "confirmation.rewardsHeading": "Your rewards",
  "confirmation.paymentHeading": "Complete your €{amount} donation",
  "confirmation.paymentInstructions":
    "Select the €{amount} option below to complete your {tierName} registration.",
  "confirmation.afterDonation": "After completing your donation above:",
  "confirmation.confirmButton": "I\u2019ve completed my donation",
  "confirmation.confirming": "Confirming\u2026",
  "confirmation.confirmed": "Payment confirmed — you're all set!",
  "confirmation.confirmError":
    "Could not confirm payment. Please try again.",
  "confirmation.confirmFailed": "Confirmation failed",
  "confirmation.viewPage": "View your page →",
  "confirmation.shareHeading": "Share your page",

  // fundraiser (FundraiserPage)
  "fundraiser.notFoundHeading": "Fundraiser not found",
  "fundraiser.notFoundText":
    "This fundraiser doesn't exist or may have been removed.",
  "fundraiser.createOwn": "Create your own fundraiser →",
  "fundraiser.draftBanner":
    "This page is a draft — only the creator can see it",
  "fundraiser.nameSuffix": "'s page",
  "fundraiser.personalGoal": "Personal goal: €{goal}",
  "fundraiser.collectiveTotal": "Collective total: €{total}",
  "fundraiser.donateHeading": "Donate",
  "fundraiser.shareHeading": "Share this page",
  "fundraiser.publishing": "Publishing\u2026",
  "fundraiser.publish": "Publish this page",

  // donorWall
  "donorWall.heading": "Supporters",
  "donorWall.empty": "No supporters yet — be the first!",
  "donorWall.loading": "Loading\u2026",
  "donorWall.gateButton": "I've donated — leave a message of support",
  "donorWall.nameLabel": "Your name",
  "donorWall.namePlaceholder": "How you want to appear",
  "donorWall.messageLabel": "Your message",
  "donorWall.messagePlaceholder": "A word of encouragement...",
  "donorWall.posting": "Posting\u2026",
  "donorWall.postButton": "Post to wall",
  "donorWall.thankYou": "Thank you for your support!",
  "donorWall.errorName": "Name must be 2-50 characters",
  "donorWall.errorMessage": "Message must be 5-200 characters",
  "donorWall.networkError": "Network error. Please try again.",
  "donorWall.globalError": "Something went wrong.",

  // event
  "event.coOrganisers": "Co-organised by",

  // social
  "social.shareWhatsApp": "Share on WhatsApp",
  "social.shareLinkedIn": "Share on LinkedIn",
  "social.shareFacebook": "Share on Facebook",
  "social.shareX": "Share on X",
  "social.shareEmail": "Share via Email",
  "social.copyLink": "Copy link",
  "social.shareMessage":
    "Support {title}'s fundraiser for Run for Ukraine 2026! Every euro funds charging stations for Ukraine's defenders.",

  // common
  "common.loading": "Loading",
  "common.charCount": "{count}/{max}",
  "common.optional": "(optional)",

  // closed (post-event mode)
  "closed.eventCompleted": "Event completed · 23 August 2026",
  "closed.thankYou":
    "Thank you to every runner, donor, and supporter who made this possible.",
  "closed.registrationClosed": "Registration is closed",
  "closed.fundraiseClosed": "Fundraiser creation is closed",
  "closed.seeResults": "See the event results →",
  "closed.donationsClosed": "Donations are closed",
  "closed.finalResults": "Final results",
  "closed.galleryHeading": "Event Photos",
  "closed.accountabilityHeading": "Impact Report",
  "closed.totalRaised": "Total raised",
  "closed.chargingStations": "Charging stations funded",
  "closed.impactStatement":
    "Every euro raised went directly to Hurkit, providing charging stations for Ukraine's defenders.",

  // errors (backend error code mappings)
  "errors.VALIDATION_FULLNAME_REQUIRED": "Full name is required",
  "errors.VALIDATION_EMAIL_INVALID": "Please enter a valid email address",
  "errors.VALIDATION_TSHIRT_INVALID": "Valid t-shirt size is required",
  "errors.VALIDATION_LANGUAGE_INVALID": "Valid language is required",
  "errors.VALIDATION_COUNTRY_REQUIRED": "Country is required",
  "errors.VALIDATION_TIER_INVALID": "Valid tier is required",
  "errors.VALIDATION_GDPR_REQUIRED":
    "GDPR consent is required to register",
  "errors.VALIDATION_PARTICIPATION_TYPE_REQUIRED":
    "Participation type is required",
  "errors.VALIDATION_DISPLAYNAME_LENGTH":
    "Display name must be 2-50 characters",
  "errors.VALIDATION_MESSAGE_REQUIRED": "Message is required",
  "errors.VALIDATION_MESSAGE_LENGTH": "Message must be under 500 characters",
  "errors.VALIDATION_GOAL_INVALID":
    "Goal must be a whole number between 10 and 100,000",
  "errors.VALIDATION_PHOTO_TYPE": "Photo must be JPEG, PNG, or WebP",
  "errors.VALIDATION_PHOTO_SIZE": "Photo must be under 5MB",
  "errors.VALIDATION_STATUS_INVALID": "Invalid status value",
  "errors.VALIDATION_AUTH_REQUIRED": "Authentication is required",
  "errors.VALIDATION_AUTH_INVALID": "Invalid authentication token",
  "errors.VALIDATION_DONOR_NAME_LENGTH": "Name must be 2-50 characters",
  "errors.VALIDATION_DONOR_MESSAGE_LENGTH":
    "Message must be 5-200 characters",
  "errors.VALIDATION_SLUG_REQUIRED": "Fundraiser slug is required",
  "errors.VALIDATION_SLUG_NOT_FOUND": "Fundraiser not found",
  "errors.INTERNAL_ERROR": "An unexpected error occurred. Please try again.",
} satisfies Locale;
