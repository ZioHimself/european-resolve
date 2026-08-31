import type { EmailLocale } from "./types.js";

export const nl: EmailLocale = {
  eventName: "Run for Ukraine",
  subject:
    "Run for Ukraine | Inschrijving bevestigd!",
  greeting: "Hallo {name},",
  confirmationIntro:
    "Je inschrijving voor Run for Ukraine is bevestigd. Hier zijn je gegevens:",
  participantIdLabel: "Deelnemersnummer",
  tierLabel: "Formule",
  amountLabel: "Bedrag",
  rewardsLabel: "Jouw beloningen",
  rewardsLabelPending: "Je gekozen formule bevat",
  rewardsDisclaimer:
    "De uiteindelijke beloningen zijn afhankelijk van je donatiebedrag.",
  physicalRewardsNoticeHeading: "Fysieke beloningen: vertraging bij uitreiking",
  physicalRewardsNoticeBody:
    "Onze voorraad stickers, sokken, t-shirts en sjaals is op. Je beloningen worden uitgereikt zodra onze nieuwe bestelling arriveert. Tombolaloten en de Oekraïense maaltijd zijn beschikbaar op het evenement. Om de afhaling van fysieke beloningen te regelen, mail naar",
  donationHeading: "Rond je donatie af",
  alreadyPaidNotice:
    "Heb je al betaald? Dan sturen we je het betalingsbewijs zodra we je betaling hebben verwerkt.",
  donationInstructions:
    "Om je {tierName}-inschrijving te voltooien, gelieve je donatie van €{amount} te doen via onderstaande link.",
  donationButton: "Doneer €{amount}",
  eventDetailsHeading: "Evenementdetails",
  eventDate: "23 augustus 2026, 10:00",
  eventLocation: "Place du Luxembourg, Brussel, België",
  footerText:
    "Deze e-mail is verzonden door European Resolve VZW als bevestiging van je inschrijving voor Run for Ukraine.",
  footerUnsubscribe:
    "Je ontvangt dit bericht omdat je je hebt ingeschreven voor het evenement. Er worden geen verdere e-mails verstuurd tenzij je hebt ingestemd met communicatie.",
  footerPaymentEmail:
    "Je ontvangt nog één e-mail wanneer je betaling is bevestigd.",
  fundraiserSubject:
    "Run for Ukraine | Je actiepagina staat online!",
  fundraiserIntro:
    "Goed nieuws, {name}! Je bent ingeschreven ÉN je persoonlijke actiepagina staat online. Deel de link met vrienden en familie om je doel te bereiken.",
  fundraiserHeading: "Je actiepagina",
  fundraiserPageLabel: "Deel deze link",
  fundraiserEditLabel: "Bewerk je pagina",
  fundraiserEditHint:
    "Bewaar deze link. Het is de enige manier om je actiepagina te bewerken. Deel deze niet publiekelijk.",
  fundraiserDisplayNameLabel: "Weergavenaam",
  fundraiserGoalLabel: "Persoonlijk doel",
  paymentSubject:
    "Run for Ukraine | Betaling bevestigd!",
  paymentIntro:
    "Je donatie is ontvangen. Hier is de informatie over je betaling:",
  paymentRewardsLabel: "Jouw beloningen",
  paymentThankYou:
    "Bedankt voor je steun aan de verdedigers van Oekraïne! Elke euro financiert laadstations aan het front.",
  paymentFooter:
    "Dit is je betalingsbewijs van European Resolve VZW voor Run for Ukraine.",
  delayedRewardsSubject: "Run for Ukraine | Update over je beloningen",
  delayedRewardsIntro:
    "Bedankt dat je meedoet aan Run for Ukraine en voor je gulle donatie. Onze excuses: onze fysieke beloningen waren uitverkocht voordat je betaling werd bevestigd, dus de onderstaande items kunnen we niet uitreiken op de dag van het evenement zelf.",
  delayedRewardsListHeading: "Niet beschikbaar op de dag van het evenement",
  delayedRewardsPromise:
    "We hebben een tweede bestelling geplaatst. Je ontvangt deze beloningen zodra die arriveert.",
  delayedRewardsContactBody:
    "Om de afhaling te regelen zodra je beloningen klaar zijn, mail naar",
  delayedRewardsEventDayNote:
    "Andere beloningen van je formule zijn nog steeds beschikbaar op het evenement, waaronder tombolaloten en, indien je formule dit omvat, de traditionele Oekraïense maaltijd.",
  delayedRewardsFooter:
    "Deze e-mail is verzonden door European Resolve VZW over je inschrijving voor Run for Ukraine.",
  delayedRewardLabels: {
    running_socks: "Hardloopsokken",
    t_shirt: "T-shirt",
    silk_scarf: "Zijden sjaal van een Oekraïens designmerk",
    sticker_pack: "Stickerpakket",
  },
  closingSubject: "Run for Ukraine | Bedankt. Evenement afgesloten",
  closingIntroLead: "Namens de organisatoren",
  closingIntroThankYou:
    "bedankt aan elke deelnemer en donateur die meedeed aan en Run for Ukraine 2026 steunde. En een hartelijk dank aan al onze vrijwilligers, die de dag zo soepel lieten verlopen.",
  closingIntroEventContext:
    "On 23 August, we came together in Brussels to mark Ukraine's National Flag Day and the eve of the 35th anniversary of Ukraine's Independence. Through your participation, generosity, and support, we turned this occasion into a day of solidarity, community, and real action in support of Ukraine.",
  closingIntroHeartfelt:
    "You helped make this initiative truly special — full of love, happiness, hope, beautiful smiles, and warm hugs. 💙💛",
  closingIntroVolunteers:
    "And a heartfelt thank you to all our volunteers, whose hard work behind the scenes made the day run so smoothly.",
  closingAchievementsHeading: "Wat we samen bereikten",
  closingAchievementRunners: "170+ lopers",
  closingAchievementDonors:
    "234 donateurs vóór sluiting, plus 6 daarna en tientallen meer via de tombola",
  closingAchievementAmount: "€6.473 opgehaald via ons vóór het evenement sloot",
  closingCommunityThanks:
    "None of this would have been possible without the incredible support of the Belgian community and the hard work of everyone who helped bring the event to life.",
  closingFollowUpBody:
    "we sturen een vervolgmail zodra de uitrusting is aangekocht. Reken op ongeveer drie weken.",
  closingPhotosHeading: "Foto's van de run",
  closingPhotosBodyBefore: "Prachtige foto's van fotografe Anastasiia Varvarina zijn beschikbaar",
  closingPhotosCredit:
    "We are incredibly grateful to Anastasiia for capturing the spirit of the day so beautifully.",
  closingPhotosShareNote:
    "Please feel free to share the photos, and remember to credit the photographer. And don't forget to tag and mention the organisers — every mention helps us reach more people and continue working towards the cause. 😊",
  closingMerchHeading: "Stickerpakketten, tokens en merchandise",
  closingMerchPickupIntro:
    "Veel deelnemers hebben hun stickerpakketten en tokens niet opgehaald. Je kunt ze ophalen bij het Ukrainian Solidarity Café",
  closingMerchPickupAt: "You can do so at the Ukrainian Solidarity Café:",
  closingMerchPickupSaturday: "Deze zaterdag, 12:00–19:00",
  closingMerchPickupFollowing: "Tijdens volgende shifts de komende maand, 12:00–16:00",
  closingMerchCafeFood:
    "Don't forget to order some traditional Ukrainian food while you're there — all the funds from the café go towards supporting Ukraine's defenders.",
  closingMerchContactBody:
    "Als je voor merchandise hebt gedoneerd en het nog niet hebt ontvangen, neem contact op met Olena",
  closingMerchItemsIntro:
    "Wil je merchandise ophalen tegen een donatie? We hebben nog een paar items over. Stuur Olena een bericht om het te regelen:",
  closingMerchItemSocks: "Hardloopsokken: €10 donatie",
  closingMerchItemTShirt: "Katoenen T-shirts: €18 donatie",
  closingMerchItemRunningTShirt: "Hardloop-T-shirt (1 over): €25 donatie",
  closingMerchItemScarves: "Zijden sjaals: €60 donatie",
  closingRaffleHeading: "Tombolawinnaars",
  closingRaffleIntro:
    "Sommige deelnemers vertrokken vóór de tombola, maar we hebben elke prijs bewaard voor de eigenaar. Winnende tickets:",
  closingRaffleSponsorsThanks:
    "A very special thank you to all the generous Ukrainian organisations and businesses who donated the amazing prizes. From vouchers and experiences to wonderful gifts and goodies, the response was truly overwhelming — your generosity made the event even more special! 🙏",
  closingRaffleWinningTicketsHeading: "Winning tickets:",
  closingRaffleClaimBody:
    "Staat jouw ticket op de lijst, neem dan contact op met Cataldo ({cataldoContact}) om je prijs op te halen.",
  closingWarmupThanksHeading: "A special thank you",
  closingWarmupThanksBefore: "Een speciaal dankwoord aan",
  closingWarmupThanksAfter:
    "voor het leiden van de warming-up en het creëren van zo'n geweldige energie.",
  closingTeamThanks:
    "And, of course, a huge thank you to our entire team at European Resolve, Ukrainian Voices, and Гуркіт Charity Foundation, as well as the Embassy of Ukraine in the Kingdom of Belgium, for their support.",
  closingParticipantThanks:
    "Most importantly, thank you to every one of you who ran, donated, spread the word, volunteered, or supported Ukraine through real action. With this run, we once again showed that Ukraine's victory is a common goal and a shared responsibility of the whole European community — and that to achieve it, we need to work together, shoulder to shoulder. 💙💛",
  closingUafThanks:
    "And a heartfelt thank you to the Ukrainian Armed Forces for defending Ukraine, its Independence, and all of us.",
  closingStayInvolvedHeading: "Blijf betrokken",
  closingStayInvolvedRunningClubBefore:
    "Blijf met ons lopen. Onze vrijwilliger Yurii start een Oekraïense hardloopclub. Doe mee in de",
  closingStayInvolvedRunningClubMid: "voor updates, of volg",
  closingStayInvolvedRunningClubAfter: "op Instagram.",
  closingStayInvolvedEuropeanResolveBefore: "Steun de Europese defensieparaatheid. Volg toekomstige evenementen op",
  closingStayInvolvedEuropeanResolveAfter: ".",
  closingStayInvolvedUvRcBefore:
    "Creatieve projecten ter ondersteuning van de Oekraïense gemeenschap in België:",
  closingStayInvolvedUvRcAfter: ".",
  closingStayInvolvedHurkitBefore: "Projecten ter ondersteuning van de verdediging van Oekraïne:",
  closingStayInvolvedHurkitAfter: ".",
  closingSignOff: "Nogmaals bedankt aan iedereen. Tot het volgende evenement.",
  closingSignOffClosing:
    "Keep supporting Ukraine, keep running with us, and we hope to see you at our next events! 💙💛",
  closingGloryUkraine: "Слава Україні! Героям слава! 🇺🇦",
  closingFooter:
    "Deze e-mail is verzonden door European Resolve VZW over Run for Ukraine 2026. Je ontvangt deze omdat je je voor het evenement hebt ingeschreven.",
  tierRewards: {
    donor: "Bedankt voor je steun aan de verdedigers van Oekraïne",
    supporter: "Hoor hoe je donatie heeft geholpen",
    sprinter: "Lopen · Stickerpakket",
    "relay-runner": "Lopen · Stickerpakket · Hardloopsokken · 1 tombolalot",
    marathoner:
      "Lopen · T-shirt · Stickerpakket · Traditionele Oekraïense maaltijd · 3 tombolaloten",
    ultramarathoner:
      "Lopen · Stickerpakket · Zijden sjaal van een Oekraïens designmerk · Traditionele Oekraïense maaltijd · 5 tombolaloten",
  },
};
