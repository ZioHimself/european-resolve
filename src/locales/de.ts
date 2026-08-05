import type { Locale } from "./types";

export const de = {
  // hero
  "hero.overline": "Wohltätigkeitslauf · Brüssel",
  "hero.beneficiary": "Begünstigter:",

  // tracks
  "tracks.heading": "Wählen Sie Ihre Strecke",
  "tracks.subtitle":
    "Zwei Wege zu unterstützen, ein Ziel. Wählen Sie\u00a0eine\u00a0Strecke.",
  "tracks.trackAOverline": "Strecke A",
  "tracks.trackATitle": "Spenden oder Laufen",
  "tracks.trackADescription":
    "Wählen Sie eine Stufe und tragen Sie direkt bei — laufen Sie am Tag selbst mit oder unterstützen Sie einfach von überall. Ihr Beitrag finanziert Ladestationen für Verteidiger.",
  "tracks.trackAFeatures": "Laufen · Stickerpaket · Socken · Tombola-Lose",
  "tracks.trackACta": "Stufen ansehen →",
  "tracks.trackBOverline": "Strecke B",
  "tracks.trackBTitle": "Spenden sammeln und Laufen",
  "tracks.trackBDescription":
    "Erstellen Sie Ihre persönliche Spendenseite und mobilisieren Sie Ihr Netzwerk. Jede Spende zählt für das gemeinsame Ziel — dann kommen Sie selbst zum Laufen.",
  "tracks.trackBFeatures":
    "Persönliche Seite · Teilbarer Link · Live-Statistiken",
  "tracks.trackBCta": "Meine Seite erstellen →",

  // progress
  "progress.overline": "Live-Fortschritt",
  "progress.indicator": "Live aktualisiert",
  "progress.raised": "Gesammelt",
  "progress.goal": "Ziel",
  "progress.participants": "Teilnehmer",
  "progress.donors": "Spender",
  "progress.barLabel": "€{raised} gesammelt · Ziel €{goal}",
  "progress.finalResults": "Endergebnisse",

  // register
  "register.overline": "Strecke A · Spenden oder Laufen",
  "register.title": "Wählen Sie eine Stufe",
  "register.subtitle":
    "Jede Stufe finanziert direkt Ladestationen für die Verteidiger der Ukraine. Laufen Sie am Tag selbst mit oder unterstützen Sie einfach von überall.",
  "register.heading": "Ihre Daten",
  "register.howParticipate": "Wie möchten Sie teilnehmen?",
  "register.runOnDay": "Ich laufe am Tag selbst mit",
  "register.supportAnywhere": "Ich unterstütze von überall",
  "register.errorSummary": "Bitte korrigieren Sie Folgendes:",
  "register.fullName": "Vollständiger Name",
  "register.email": "E-Mail",
  "register.phone": "Telefon",
  "register.tshirtSize": "T-Shirt-Größe",
  "register.language": "Sprache",
  "register.country": "Land",
  "register.optional": "(optional)",
  "register.gdprHeading": "DSGVO-Einwilligung (erforderlich)",
  "register.gdprRunner":
    "Ich stimme der Verarbeitung meiner Daten zum Zweck der Laufanmeldung und Sicherheit zu, gemäß der Datenschutzerklärung.",
  "register.gdprSupporter":
    "Ich stimme der Verarbeitung meiner Daten zum Zweck der Veranstaltungsanmeldung und Spendenverfolgung zu, gemäß der Datenschutzerklärung.",
  "register.commsHeading": "Zukünftige Kommunikation (optional)",
  "register.commsText":
    "Senden Sie mir Neuigkeiten über zukünftige Ausgaben und die Arbeit des Begünstigten. Ich kann mich jederzeit abmelden.",
  "register.total": "Gesamt: €{price}",
  "register.totalEmpty": "Gesamt: €—",
  "register.submitRunner": "Anmelden — €{price}",
  "register.submitSupporter": "Unterstützen — €{price}",
  "register.submitting": "Anmeldung läuft...",
  "register.selectTier": "Wählen Sie eine Stufe zur Anmeldung",
  "register.failedFallback":
    "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
  "register.networkError":
    "Verbindung zum Anmeldeserver nicht möglich. Bitte versuchen Sie es später erneut.",
  "register.errorFullName": "Vollständiger Name ist erforderlich",
  "register.errorEmail": "Eine gültige E-Mail-Adresse ist erforderlich",
  "register.errorTshirt": "T-Shirt-Größe ist erforderlich",
  "register.errorCountry": "Land ist erforderlich",
  "register.errorGdpr":
    "DSGVO-Einwilligung ist für die Anmeldung erforderlich",
  "register.confirmHeading": "Anmeldung bestätigt!",
  "register.confirmParticipantId": "Ihre ID: {id}",
  "register.confirmName": "Name",
  "register.confirmTier": "Stufe",
  "register.confirmAmount": "Betrag",
  "register.confirmRewardsHeading": "Ihre Belohnungen",
  "register.confirmDonationHeading":
    "Schließen Sie Ihre Spende von €{amount} ab",
  "register.confirmDonationInstructions":
    "Bitte wählen Sie unten die Option €{amount}, um Ihre {tierName}-Anmeldung abzuschließen.",
  "register.confirmAfterDonation":
    "Nach Abschluss Ihrer Spende oben:",
  "register.confirmButton": "Ich habe meine Spende abgeschlossen",
  "register.confirmingPayment": "Bestätigung\u2026",
  "register.confirmedHeading": "Zahlung erhalten — vielen Dank!",
  "register.confirmedRunner":
    "Ihre Anmeldung ist nun vollständig. Sie erhalten Ihr Laufmaterial bei der Veranstaltung.",
  "register.confirmedSupporter":
    "Vielen Dank für Ihre Unterstützung aus der Ferne! Sie erhalten ein digitales Zertifikat per E-Mail.",
  "register.confirmFailed": "Bestätigung fehlgeschlagen",
  "register.confirmNetworkError":
    "Zahlung konnte nicht bestätigt werden. Bitte versuchen Sie es erneut.",
  "register.interruptedSession":
    "Es sieht so aus, als wäre Ihre Sitzung unterbrochen worden. Wenn Sie Ihre Zahlung bereits abgeschlossen haben, kontaktieren Sie uns bitte unter info@european-resolve.org mit Ihrer Zahlungsbestätigung und wir aktualisieren Ihre Anmeldung.",
  "register.verifyingPayment": "Zahlung wird überprüft\u2026",
  "register.needInvoice": "Rechnung benötigt?",
  "register.startOver": "Erneut anmelden",

  // tierCard
  "tierCard.badge": "Am häufigsten gewählt",
  "tierCard.selected": "Ausgewählt",
  "tierCard.select": "Auswählen",

  // fundraise
  "fundraise.overline": "Strecke B · Spenden sammeln und Laufen",
  "fundraise.title": "Ihre Spendenseite",
  "fundraise.subtitle":
    "Das dauert etwa eine Minute. Teilen Sie Ihre Seite mit Freunden und Familie, um das gemeinsame Ziel zu erreichen — dann kommen Sie selbst zum Laufen.",
  "fundraise.step1": "1. Ihre Seite",
  "fundraise.step2": "2. Läuferdaten",
  "fundraise.step3": "3. Überprüfung",
  "fundraise.step1Heading": "Erstellen Sie Ihre Spendenseite",
  "fundraise.photoLabel": "+ Foto",
  "fundraise.displayName": "Anzeigename",
  "fundraise.displayNamePlaceholder":
    "Wie Sie auf Ihrer Seite erscheinen möchten",
  "fundraise.personalMessage": "Persönliche Nachricht",
  "fundraise.messagePlaceholder":
    "Warum laufen Sie? Was treibt Sie an?",
  "fundraise.goalLabel": "Persönliches Ziel (€)",
  "fundraise.nextRunner": "Weiter: Läuferdaten →",
  "fundraise.step2Heading": "Ihre Läuferanmeldung",
  "fundraise.fullName": "Vollständiger Name",
  "fundraise.email": "E-Mail",
  "fundraise.phone": "Telefon",
  "fundraise.tshirtSize": "T-Shirt-Größe",
  "fundraise.language": "Sprache",
  "fundraise.country": "Land",
  "fundraise.gdprHeading": "DSGVO-Einwilligung (erforderlich)",
  "fundraise.gdprText":
    "Ich stimme der Verarbeitung meiner Daten zum Zweck der Laufanmeldung und Sicherheit zu, gemäß der Datenschutzerklärung.",
  "fundraise.commsHeading": "Zukünftige Kommunikation (optional)",
  "fundraise.commsText":
    "Senden Sie mir Neuigkeiten über zukünftige Ausgaben und die Arbeit des Begünstigten.",
  "fundraise.back": "← Zurück",
  "fundraise.nextReview": "Weiter: Überprüfung →",
  "fundraise.step3Heading": "Überprüfen und absenden",
  "fundraise.reviewPage": "Ihre Spendenseite",
  "fundraise.reviewDisplayName": "Anzeigename",
  "fundraise.reviewMessage": "Nachricht",
  "fundraise.reviewGoal": "Ziel",
  "fundraise.reviewPhoto": "Foto",
  "fundraise.reviewUploaded": "Hochgeladen",
  "fundraise.reviewNone": "Keines",
  "fundraise.reviewRegistration": "Läuferanmeldung",
  "fundraise.reviewTier": "Stufe",
  "fundraise.reviewFullName": "Vollständiger Name",
  "fundraise.reviewEmail": "E-Mail",
  "fundraise.reviewTshirt": "T-Shirt",
  "fundraise.reviewCountry": "Land",
  "fundraise.submitButton": "Seite erstellen und anmelden — €{price}",
  "fundraise.submitting": "Erstellen\u2026",
  "fundraise.networkError":
    "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
  "fundraise.globalError":
    "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  "fundraise.errorDisplayName":
    "Anzeigename muss 2-50 Zeichen lang sein",
  "fundraise.errorMessageRequired": "Nachricht ist erforderlich",
  "fundraise.errorMessageLength":
    "Nachricht muss weniger als 500 Zeichen lang sein",
  "fundraise.errorGoal":
    "Ziel muss eine ganze Zahl zwischen 10 und 100.000 sein",
  "fundraise.errorTier": "Bitte wählen Sie eine Stufe",
  "fundraise.errorFullName": "Vollständiger Name ist erforderlich",
  "fundraise.errorEmail": "Eine gültige E-Mail-Adresse ist erforderlich",
  "fundraise.errorCountry": "Land ist erforderlich",
  "fundraise.errorGdpr":
    "DSGVO-Einwilligung ist für die Anmeldung erforderlich",
  "fundraise.errorPhoto": "Foto muss kleiner als 5 MB sein",
  "fundraise.errorPhotoType": "Foto muss im JPEG-, PNG- oder WebP-Format sein",

  // confirmation (FundraiserConfirmation)
  "confirmation.heading": "Ihre Spendenseite ist fertig!",
  "confirmation.subheading":
    "Teilen Sie Ihre Seite mit Freunden und Familie — {name}",
  "confirmation.shareableLink": "Ihr teilbarer Link",
  "confirmation.copy": "Kopieren",
  "confirmation.copied": "Kopiert!",
  "confirmation.editLink": "Geheimer Bearbeitungslink — bewahren Sie ihn auf!",
  "confirmation.editHint":
    "Mit diesem Link können Sie Ihre Seite bearbeiten und veröffentlichen. Halten Sie ihn privat.",
  "confirmation.registrationHeading": "Läuferanmeldung",
  "confirmation.participantId": "Ihre ID: {id}",
  "confirmation.tier": "Stufe",
  "confirmation.amount": "Betrag",
  "confirmation.rewardsHeading": "Ihre Belohnungen",
  "confirmation.paymentHeading":
    "Schließen Sie Ihre Spende von €{amount} ab",
  "confirmation.paymentInstructions":
    "Wählen Sie unten die Option €{amount}, um Ihre {tierName}-Anmeldung abzuschließen.",
  "confirmation.afterDonation":
    "Nach Abschluss Ihrer Spende oben:",
  "confirmation.confirmButton": "Ich habe meine Spende abgeschlossen",
  "confirmation.confirming": "Bestätigung\u2026",
  "confirmation.confirmed": "Zahlung bestätigt — alles erledigt!",
  "confirmation.confirmError":
    "Zahlung konnte nicht bestätigt werden. Bitte versuchen Sie es erneut.",
  "confirmation.confirmFailed": "Bestätigung fehlgeschlagen",
  "confirmation.interruptedSession":
    "Es sieht so aus, als wäre Ihre Sitzung unterbrochen worden. Wenn Sie Ihre Zahlung bereits abgeschlossen haben, kontaktieren Sie uns bitte unter info@european-resolve.org mit Ihrer Zahlungsbestätigung und wir aktualisieren Ihre Anmeldung.",
  "confirmation.verifyingPayment": "Zahlung wird überprüft\u2026",
  "confirmation.viewPage": "Ihre Seite ansehen →",
  "confirmation.shareHeading": "Teilen Sie Ihre Seite",

  // fundraiser (FundraiserPage)
  "fundraiser.notFoundHeading": "Spendenseite nicht gefunden",
  "fundraiser.notFoundText":
    "Diese Spendenseite existiert nicht oder wurde entfernt.",
  "fundraiser.createOwn": "Erstellen Sie Ihre eigene Spendenseite →",
  "fundraiser.draftBanner":
    "Diese Seite ist ein Entwurf — nur der Ersteller kann sie sehen",
  "fundraiser.nameSuffix": "s Seite",
  "fundraiser.personalGoal": "Persönliches Ziel: €{goal}",
  "fundraiser.raisedSoFar": "Bisher gesammelt: €{raised}",
  "fundraiser.collectiveTotal": "Gesamtsumme: €{total}",
  "fundraiser.donateHeading": "Spenden",
  "fundraiser.shareHeading": "Diese Seite teilen",
  "fundraiser.ctaButton": "{name} unterstützen",
  "fundraiser.thankYouDonation": "Vielen Dank für Ihre Spende!",
  "fundraiser.manualConfirm": "Ich habe meine Spende abgeschlossen",
  "fundraiser.publishing": "Veröffentlichen\u2026",
  "fundraiser.publish": "Diese Seite veröffentlichen",
  "fundraiser.edit": "Spendenaktion bearbeiten",
  "fundraiser.editMessage": "Ihre Nachricht",
  "fundraiser.editGoal": "Spendenziel (€)",
  "fundraiser.save": "Änderungen speichern",
  "fundraiser.saving": "Speichern…",
  "fundraiser.saveFailed": "Änderungen konnten nicht gespeichert werden",
  "fundraiser.cancel": "Abbrechen",

  // donorWall
  "donorWall.heading": "Unterstützer",
  "donorWall.empty": "Noch keine Unterstützer — seien Sie der Erste!",
  "donorWall.loading": "Laden\u2026",
  "donorWall.gateButton":
    "Ich habe gespendet — eine Unterstützungsnachricht hinterlassen",
  "donorWall.nameLabel": "Ihr Name",
  "donorWall.namePlaceholder": "Wie Sie erscheinen möchten",
  "donorWall.messageLabel": "Ihre Nachricht",
  "donorWall.messagePlaceholder": "Ein Wort der Ermutigung...",
  "donorWall.posting": "Posten\u2026",
  "donorWall.postButton": "An die Wand posten",
  "donorWall.thankYou": "Vielen Dank für Ihre Unterstützung!",
  "donorWall.privacyNotice":
    "Ihr Name und Ihre Nachricht werden öffentlich sichtbar sein.",
  "donorWall.errorName": "Name muss 2-50 Zeichen lang sein",
  "donorWall.errorMessage": "Nachricht muss 5-200 Zeichen lang sein",
  "donorWall.networkError":
    "Netzwerkfehler. Bitte versuchen Sie es erneut.",
  "donorWall.globalError": "Etwas ist schiefgelaufen.",

  // event
  "event.coOrganisers": "Mitorganisiert von",

  // social
  "social.shareWhatsApp": "Auf WhatsApp teilen",
  "social.shareLinkedIn": "Auf LinkedIn teilen",
  "social.shareFacebook": "Auf Facebook teilen",
  "social.shareX": "Auf X teilen",
  "social.shareEmail": "Per E-Mail teilen",
  "social.copyLink": "Link kopieren",
  "social.shareMessage":
    "Unterstützen Sie die Spendenaktion von {title} für Run for Ukraine 2026! Jeder Euro finanziert Ladestationen für die Verteidiger der Ukraine.",

  // common
  "common.loading": "Laden",
  "common.charCount": "{count}/{max}",
  "common.optional": "(optional)",

  // closed (post-event mode)
  "closed.eventCompleted": "Veranstaltung abgeschlossen · 23. August 2026",
  "closed.thankYou":
    "Vielen Dank an jeden Läufer, Spender und Unterstützer, der dies möglich gemacht hat.",
  "closed.registrationClosed": "Anmeldungen sind geschlossen",
  "closed.fundraiseClosed": "Spendenseiten-Erstellung ist geschlossen",
  "closed.seeResults": "Veranstaltungsergebnisse ansehen →",
  "closed.donationsClosed": "Spenden sind geschlossen",
  "closed.finalResults": "Endergebnisse",
  "closed.galleryHeading": "Veranstaltungsfotos",
  "closed.accountabilityHeading": "Wirkungsbericht",
  "closed.totalRaised": "Insgesamt gesammelt",
  "closed.chargingStations": "Ladestationen finanziert",
  "closed.impactStatement":
    "Jeder gesammelte Euro ging direkt an Hurkit, um Ladestationen für die Verteidiger der Ukraine bereitzustellen.",

  // errors (backend error code mappings)
  "errors.VALIDATION_FULLNAME_REQUIRED":
    "Vollständiger Name ist erforderlich",
  "errors.VALIDATION_EMAIL_INVALID":
    "Bitte geben Sie eine gültige E-Mail-Adresse ein",
  "errors.VALIDATION_TSHIRT_INVALID":
    "Eine gültige T-Shirt-Größe ist erforderlich",
  "errors.VALIDATION_LANGUAGE_INVALID":
    "Eine gültige Sprache ist erforderlich",
  "errors.VALIDATION_COUNTRY_REQUIRED": "Land ist erforderlich",
  "errors.VALIDATION_TIER_INVALID": "Eine gültige Stufe ist erforderlich",
  "errors.VALIDATION_GDPR_REQUIRED":
    "DSGVO-Einwilligung ist für die Anmeldung erforderlich",
  "errors.VALIDATION_PARTICIPATION_TYPE_REQUIRED":
    "Teilnahmeart ist erforderlich",
  "errors.VALIDATION_DISPLAYNAME_LENGTH":
    "Anzeigename muss 2-50 Zeichen lang sein",
  "errors.VALIDATION_MESSAGE_REQUIRED": "Nachricht ist erforderlich",
  "errors.VALIDATION_MESSAGE_LENGTH":
    "Nachricht muss weniger als 500 Zeichen lang sein",
  "errors.VALIDATION_GOAL_INVALID":
    "Ziel muss eine ganze Zahl zwischen 10 und 100.000 sein",
  "errors.VALIDATION_PHOTO_TYPE":
    "Foto muss im JPEG-, PNG- oder WebP-Format sein",
  "errors.VALIDATION_PHOTO_SIZE": "Foto muss kleiner als 5 MB sein",
  "errors.VALIDATION_STATUS_INVALID": "Ungültiger Statuswert",
  "errors.VALIDATION_AUTH_REQUIRED": "Authentifizierung ist erforderlich",
  "errors.VALIDATION_AUTH_INVALID": "Ungültiges Authentifizierungstoken",
  "errors.VALIDATION_DONOR_NAME_LENGTH":
    "Name muss 2-50 Zeichen lang sein",
  "errors.VALIDATION_DONOR_MESSAGE_LENGTH":
    "Nachricht muss 5-200 Zeichen lang sein",
  "errors.VALIDATION_SLUG_REQUIRED": "Spendenseiten-ID ist erforderlich",
  "errors.VALIDATION_SLUG_NOT_FOUND": "Spendenseite nicht gefunden",
  "errors.INTERNAL_ERROR":
    "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",

  // nav (breadcrumbs)
  "nav.events": "Veranstaltungen",
  "nav.register": "Anmeldung",
  "nav.fundraise": "Spenden sammeln",
  "nav.fundraiser": "Spendenseite",

  // feeBreakdown
  "feeBreakdown.overline": "Wohin es geht",
  "feeBreakdown.cause": "Zweck",
  "feeBreakdown.logistics": "Logistik",
} satisfies Locale;
