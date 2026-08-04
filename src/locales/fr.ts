import type { Locale } from "./types";

export const fr = {
  // hero
  "hero.overline": "Course caritative · Bruxelles",
  "hero.beneficiary": "Bénéficiaire :",

  // tracks
  "tracks.heading": "Choisissez votre parcours",
  "tracks.subtitle":
    "Deux façons de soutenir, un seul objectif. Choisissez\u00a0un\u00a0parcours.",
  "tracks.trackAOverline": "Parcours A",
  "tracks.trackATitle": "Donner ou Courir",
  "tracks.trackADescription":
    "Choisissez un palier et contribuez directement — courez le jour J ou soutenez simplement depuis n'importe où. Votre contribution finance des stations de recharge pour les défenseurs.",
  "tracks.trackAFeatures": "Dossard · Médaille d'arrivée · T-shirt",
  "tracks.trackACta": "Voir les paliers →",
  "tracks.trackBOverline": "Parcours B",
  "tracks.trackBTitle": "Collecter et Courir",
  "tracks.trackBDescription":
    "Créez votre page de collecte personnelle et mobilisez votre réseau. Chaque don compte pour l'objectif collectif — puis venez courir.",
  "tracks.trackBFeatures": "Page personnelle · Lien partageable · Stats en direct",
  "tracks.trackBCta": "Créer ma page →",

  // progress
  "progress.overline": "Progression en direct",
  "progress.indicator": "Mis à jour en direct",
  "progress.raised": "Collecté",
  "progress.goal": "Objectif",
  "progress.participants": "Participants",
  "progress.donors": "Donateurs",
  "progress.barLabel": "€{raised} collectés · Objectif €{goal}",
  "progress.finalResults": "Résultats finaux",

  // register
  "register.overline": "Parcours A · Donner ou Courir",
  "register.title": "Choisissez un palier",
  "register.subtitle":
    "Chaque palier finance directement des stations de recharge pour les défenseurs de l'Ukraine. Courez le jour J ou soutenez simplement depuis n'importe où.",
  "register.heading": "Vos coordonnées",
  "register.howParticipate": "Comment allez-vous participer ?",
  "register.runOnDay": "Je courrai le jour de l'événement",
  "register.supportAnywhere": "Je soutiens depuis n'importe où",
  "register.errorSummary": "Veuillez corriger les éléments suivants :",
  "register.fullName": "Nom complet",
  "register.email": "E-mail",
  "register.phone": "Téléphone",
  "register.tshirtSize": "Taille de t-shirt",
  "register.language": "Langue",
  "register.country": "Pays",
  "register.optional": "(facultatif)",
  "register.gdprHeading": "Consentement RGPD (obligatoire)",
  "register.gdprRunner":
    "J'accepte que mes données soient traitées aux fins de l'inscription à la course et de la sécurité, conformément à la notice de confidentialité.",
  "register.gdprSupporter":
    "J'accepte que mes données soient traitées aux fins de l'inscription à l'événement et du suivi des dons, conformément à la notice de confidentialité.",
  "register.commsHeading": "Communications futures (facultatif)",
  "register.commsText":
    "Envoyez-moi des nouvelles des prochaines éditions et du travail du bénéficiaire. Je peux me désinscrire à tout moment.",
  "register.total": "Total : €{price}",
  "register.totalEmpty": "Total : €—",
  "register.submitRunner": "S'inscrire — €{price}",
  "register.submitSupporter": "Soutenir — €{price}",
  "register.submitting": "Inscription en cours...",
  "register.selectTier": "Sélectionnez un palier pour vous inscrire",
  "register.failedFallback":
    "L'inscription a échoué. Veuillez réessayer.",
  "register.networkError":
    "Impossible de se connecter au serveur d'inscription. Veuillez réessayer plus tard.",
  "register.errorFullName": "Le nom complet est obligatoire",
  "register.errorEmail": "Une adresse e-mail valide est obligatoire",
  "register.errorTshirt": "La taille de t-shirt est obligatoire",
  "register.errorCountry": "Le pays est obligatoire",
  "register.errorGdpr":
    "Le consentement RGPD est obligatoire pour s'inscrire",
  "register.confirmHeading": "Inscription confirmée !",
  "register.confirmParticipantId": "Votre ID : {id}",
  "register.confirmName": "Nom",
  "register.confirmTier": "Palier",
  "register.confirmAmount": "Montant",
  "register.confirmRewardsHeading": "Vos récompenses",
  "register.confirmDonationHeading": "Complétez votre don de €{amount}",
  "register.confirmDonationInstructions":
    "Veuillez sélectionner l'option à €{amount} ci-dessous pour compléter votre inscription {tierName}.",
  "register.confirmAfterDonation":
    "Après avoir complété votre don ci-dessus :",
  "register.confirmButton": "J'ai complété mon don",
  "register.confirmingPayment": "Confirmation en cours\u2026",
  "register.confirmedHeading": "Paiement reçu — merci !",
  "register.confirmedRunner":
    "Votre inscription est maintenant complète. Vous recevrez votre matériel de course lors de l'événement.",
  "register.confirmedSupporter":
    "Merci pour votre soutien à distance ! Vous recevrez un certificat numérique par e-mail.",
  "register.confirmFailed": "La confirmation a échoué",
  "register.confirmNetworkError":
    "Impossible de confirmer le paiement. Veuillez réessayer.",
  "register.interruptedSession":
    "Il semble que votre session a été interrompue. Si vous avez déjà effectué votre paiement, contactez-nous à info@european-resolve.org avec votre confirmation de paiement et nous mettrons à jour votre inscription.",
  "register.verifyingPayment": "Vérification du paiement\u2026",
  "register.needInvoice": "Besoin de votre facture ?",
  "register.startOver": "S\u2019inscrire à nouveau",

  // tierCard
  "tierCard.badge": "Le plus choisi",
  "tierCard.selected": "Sélectionné",
  "tierCard.select": "Sélectionner",

  // fundraise
  "fundraise.overline": "Parcours B · Collecter et Courir",
  "fundraise.title": "Votre page de collecte",
  "fundraise.subtitle":
    "Cela prend environ une minute. Partagez votre page avec vos proches pour atteindre l'objectif collectif — puis venez courir.",
  "fundraise.step1": "1. Votre page",
  "fundraise.step2": "2. Détails coureur",
  "fundraise.step3": "3. Vérification",
  "fundraise.step1Heading": "Créez votre page de collecte",
  "fundraise.photoLabel": "+ Photo",
  "fundraise.displayName": "Nom affiché",
  "fundraise.displayNamePlaceholder":
    "Comment vous souhaitez apparaître sur votre page",
  "fundraise.personalMessage": "Message personnel",
  "fundraise.messagePlaceholder":
    "Pourquoi courez-vous ? Qu'est-ce qui vous motive ?",
  "fundraise.goalLabel": "Objectif personnel (€)",
  "fundraise.nextRunner": "Suivant : Détails coureur →",
  "fundraise.step2Heading": "Votre inscription coureur",
  "fundraise.fullName": "Nom complet",
  "fundraise.email": "E-mail",
  "fundraise.phone": "Téléphone",
  "fundraise.tshirtSize": "Taille de t-shirt",
  "fundraise.language": "Langue",
  "fundraise.country": "Pays",
  "fundraise.gdprHeading": "Consentement RGPD (obligatoire)",
  "fundraise.gdprText":
    "J'accepte que mes données soient traitées aux fins de l'inscription à la course et de la sécurité, conformément à la notice de confidentialité.",
  "fundraise.commsHeading": "Communications futures (facultatif)",
  "fundraise.commsText":
    "Envoyez-moi des nouvelles des prochaines éditions et du travail du bénéficiaire.",
  "fundraise.back": "← Retour",
  "fundraise.nextReview": "Suivant : Vérification →",
  "fundraise.step3Heading": "Vérifier et soumettre",
  "fundraise.reviewPage": "Votre page de collecte",
  "fundraise.reviewDisplayName": "Nom affiché",
  "fundraise.reviewMessage": "Message",
  "fundraise.reviewGoal": "Objectif",
  "fundraise.reviewPhoto": "Photo",
  "fundraise.reviewUploaded": "Téléchargée",
  "fundraise.reviewNone": "Aucune",
  "fundraise.reviewRegistration": "Inscription coureur",
  "fundraise.reviewTier": "Palier",
  "fundraise.reviewFullName": "Nom complet",
  "fundraise.reviewEmail": "E-mail",
  "fundraise.reviewTshirt": "T-shirt",
  "fundraise.reviewCountry": "Pays",
  "fundraise.submitButton": "Créer la page et s'inscrire — €{price}",
  "fundraise.submitting": "Création en cours\u2026",
  "fundraise.networkError":
    "Erreur réseau. Veuillez vérifier votre connexion et réessayer.",
  "fundraise.globalError": "Une erreur est survenue. Veuillez réessayer.",
  "fundraise.errorDisplayName":
    "Le nom affiché doit contenir entre 2 et 50 caractères",
  "fundraise.errorMessageRequired": "Le message est obligatoire",
  "fundraise.errorMessageLength":
    "Le message doit contenir moins de 500 caractères",
  "fundraise.errorGoal":
    "L'objectif doit être un nombre entier entre 10 et 100 000",
  "fundraise.errorTier": "Veuillez sélectionner un palier",
  "fundraise.errorFullName": "Le nom complet est obligatoire",
  "fundraise.errorEmail": "Une adresse e-mail valide est obligatoire",
  "fundraise.errorCountry": "Le pays est obligatoire",
  "fundraise.errorGdpr":
    "Le consentement RGPD est obligatoire pour s'inscrire",
  "fundraise.errorPhoto": "La photo doit faire moins de 5 Mo",
  "fundraise.errorPhotoType": "La photo doit être au format JPEG, PNG ou WebP",

  // confirmation (FundraiserConfirmation)
  "confirmation.heading": "Votre page de collecte est prête !",
  "confirmation.subheading":
    "Partagez votre page avec vos proches — {name}",
  "confirmation.shareableLink": "Votre lien partageable",
  "confirmation.copy": "Copier",
  "confirmation.copied": "Copié !",
  "confirmation.editLink": "Lien d'édition secret — conservez-le !",
  "confirmation.editHint":
    "Ce lien vous permet de modifier et publier votre page. Gardez-le privé.",
  "confirmation.registrationHeading": "Inscription coureur",
  "confirmation.participantId": "Votre ID : {id}",
  "confirmation.tier": "Palier",
  "confirmation.amount": "Montant",
  "confirmation.rewardsHeading": "Vos récompenses",
  "confirmation.paymentHeading": "Complétez votre don de €{amount}",
  "confirmation.paymentInstructions":
    "Sélectionnez l'option à €{amount} ci-dessous pour compléter votre inscription {tierName}.",
  "confirmation.afterDonation":
    "Après avoir complété votre don ci-dessus :",
  "confirmation.confirmButton": "J'ai complété mon don",
  "confirmation.confirming": "Confirmation en cours\u2026",
  "confirmation.confirmed": "Paiement confirmé — vous êtes prêt !",
  "confirmation.confirmError":
    "Impossible de confirmer le paiement. Veuillez réessayer.",
  "confirmation.confirmFailed": "La confirmation a échoué",
  "confirmation.interruptedSession":
    "Il semble que votre session a été interrompue. Si vous avez déjà effectué votre paiement, contactez-nous à info@european-resolve.org avec votre confirmation de paiement et nous mettrons à jour votre inscription.",
  "confirmation.verifyingPayment": "Vérification du paiement\u2026",
  "confirmation.viewPage": "Voir votre page →",
  "confirmation.shareHeading": "Partagez votre page",

  // fundraiser (FundraiserPage)
  "fundraiser.notFoundHeading": "Page de collecte introuvable",
  "fundraiser.notFoundText":
    "Cette page de collecte n'existe pas ou a été supprimée.",
  "fundraiser.createOwn": "Créer votre propre page de collecte →",
  "fundraiser.draftBanner":
    "Cette page est un brouillon — seul le créateur peut la voir",
  "fundraiser.nameSuffix": " — page de collecte",
  "fundraiser.personalGoal": "Objectif personnel : €{goal}",
  "fundraiser.raisedSoFar": "Collecté : €{raised}",
  "fundraiser.collectiveTotal": "Total collectif : €{total}",
  "fundraiser.donateHeading": "Faire un don",
  "fundraiser.shareHeading": "Partager cette page",
  "fundraiser.ctaButton": "Soutenir {name}",
  "fundraiser.thankYouDonation": "Merci pour votre don !",
  "fundraiser.manualConfirm": "J\u2019ai effectué mon don",
  "fundraiser.publishing": "Publication en cours\u2026",
  "fundraiser.publish": "Publier cette page",
  "fundraiser.edit": "Modifier la collecte",
  "fundraiser.editMessage": "Votre message",
  "fundraiser.editGoal": "Objectif de collecte (€)",
  "fundraiser.save": "Enregistrer",
  "fundraiser.saving": "Enregistrement…",
  "fundraiser.saveFailed": "Échec de l'enregistrement",
  "fundraiser.cancel": "Annuler",

  // donorWall
  "donorWall.heading": "Soutiens",
  "donorWall.empty": "Pas encore de soutiens — soyez le premier !",
  "donorWall.loading": "Chargement\u2026",
  "donorWall.gateButton": "J'ai fait un don — laisser un message de soutien",
  "donorWall.nameLabel": "Votre nom",
  "donorWall.namePlaceholder": "Comment vous souhaitez apparaître",
  "donorWall.messageLabel": "Votre message",
  "donorWall.messagePlaceholder": "Un mot d'encouragement...",
  "donorWall.posting": "Publication\u2026",
  "donorWall.postButton": "Publier sur le mur",
  "donorWall.thankYou": "Merci pour votre soutien !",
  "donorWall.privacyNotice":
    "Votre nom et votre message seront visibles publiquement.",
  "donorWall.errorName": "Le nom doit contenir entre 2 et 50 caractères",
  "donorWall.errorMessage":
    "Le message doit contenir entre 5 et 200 caractères",
  "donorWall.networkError": "Erreur réseau. Veuillez réessayer.",
  "donorWall.globalError": "Une erreur est survenue.",

  // event
  "event.coOrganisers": "Co-organisé par",

  // social
  "social.shareWhatsApp": "Partager sur WhatsApp",
  "social.shareLinkedIn": "Partager sur LinkedIn",
  "social.shareFacebook": "Partager sur Facebook",
  "social.shareX": "Partager sur X",
  "social.shareEmail": "Partager par e-mail",
  "social.copyLink": "Copier le lien",
  "social.shareMessage":
    "Soutenez la collecte de {title} pour Run for Ukraine 2026 ! Chaque euro finance des stations de recharge pour les défenseurs de l'Ukraine.",

  // common
  "common.loading": "Chargement",
  "common.charCount": "{count}/{max}",
  "common.optional": "(facultatif)",

  // closed (post-event mode)
  "closed.eventCompleted": "Événement terminé · 23 août 2026",
  "closed.thankYou":
    "Merci à chaque coureur, donateur et soutien qui a rendu cela possible.",
  "closed.registrationClosed": "Les inscriptions sont closes",
  "closed.fundraiseClosed": "La création de collectes est close",
  "closed.seeResults": "Voir les résultats de l'événement →",
  "closed.donationsClosed": "Les dons sont clos",
  "closed.finalResults": "Résultats finaux",
  "closed.galleryHeading": "Photos de l'événement",
  "closed.accountabilityHeading": "Rapport d'impact",
  "closed.totalRaised": "Total collecté",
  "closed.chargingStations": "Stations de recharge financées",
  "closed.impactStatement":
    "Chaque euro collecté est allé directement à Hurkit, fournissant des stations de recharge pour les défenseurs de l'Ukraine.",

  // errors (backend error code mappings)
  "errors.VALIDATION_FULLNAME_REQUIRED": "Le nom complet est obligatoire",
  "errors.VALIDATION_EMAIL_INVALID":
    "Veuillez entrer une adresse e-mail valide",
  "errors.VALIDATION_TSHIRT_INVALID":
    "Une taille de t-shirt valide est obligatoire",
  "errors.VALIDATION_LANGUAGE_INVALID": "Une langue valide est obligatoire",
  "errors.VALIDATION_COUNTRY_REQUIRED": "Le pays est obligatoire",
  "errors.VALIDATION_TIER_INVALID": "Un palier valide est obligatoire",
  "errors.VALIDATION_GDPR_REQUIRED":
    "Le consentement RGPD est obligatoire pour s'inscrire",
  "errors.VALIDATION_PARTICIPATION_TYPE_REQUIRED":
    "Le type de participation est obligatoire",
  "errors.VALIDATION_DISPLAYNAME_LENGTH":
    "Le nom affiché doit contenir entre 2 et 50 caractères",
  "errors.VALIDATION_MESSAGE_REQUIRED": "Le message est obligatoire",
  "errors.VALIDATION_MESSAGE_LENGTH":
    "Le message doit contenir moins de 500 caractères",
  "errors.VALIDATION_GOAL_INVALID":
    "L'objectif doit être un nombre entier entre 10 et 100 000",
  "errors.VALIDATION_PHOTO_TYPE":
    "La photo doit être au format JPEG, PNG ou WebP",
  "errors.VALIDATION_PHOTO_SIZE": "La photo doit faire moins de 5 Mo",
  "errors.VALIDATION_STATUS_INVALID": "Valeur de statut invalide",
  "errors.VALIDATION_AUTH_REQUIRED": "L'authentification est obligatoire",
  "errors.VALIDATION_AUTH_INVALID": "Jeton d'authentification invalide",
  "errors.VALIDATION_DONOR_NAME_LENGTH":
    "Le nom doit contenir entre 2 et 50 caractères",
  "errors.VALIDATION_DONOR_MESSAGE_LENGTH":
    "Le message doit contenir entre 5 et 200 caractères",
  "errors.VALIDATION_SLUG_REQUIRED":
    "L'identifiant de la collecte est obligatoire",
  "errors.VALIDATION_SLUG_NOT_FOUND": "Page de collecte introuvable",
  "errors.INTERNAL_ERROR":
    "Une erreur inattendue est survenue. Veuillez réessayer.",

  // nav (breadcrumbs)
  "nav.events": "Événements",
  "nav.register": "Inscription",
  "nav.fundraise": "Collecte",
  "nav.fundraiser": "Page de collecte",

  // feeBreakdown
  "feeBreakdown.overline": "Répartition",
  "feeBreakdown.cause": "cause",
  "feeBreakdown.logistics": "logistique",
} satisfies Locale;
