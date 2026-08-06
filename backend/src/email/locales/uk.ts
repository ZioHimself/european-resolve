import type { EmailLocale } from "./types.js";

export const uk: EmailLocale = {
  subject:
    "35 Years of 🇺🇦 Independence: Charity and Run | Реєстрацію підтверджено!",
  greeting: "Вітаємо, {name}!",
  confirmationIntro:
    "Твою реєстрацію на 35 Years of 🇺🇦 Independence: Charity and Run підтверджено. Ось твої дані:",
  participantIdLabel: "ID учасни_ці",
  tierLabel: "Рівень",
  amountLabel: "Сума",
  rewardsLabel: "Твої нагороди",
  rewardsLabelPending: "Обраний рівень включає",
  rewardsDisclaimer: "Остаточні нагороди залежать від суми твого донату.",
  donationHeading: "Заверши донат",
  alreadyPaidNotice:
    "Якщо оплата вже здійснена, ми надішлемо тобі квитанцію одразу після обробки платежу.",
  donationInstructions:
    "Щоб завершити реєстрацію на рівні {tierName}, будь ласка, зроби донат €{amount} за посиланням нижче.",
  donationButton: "Задонатити €{amount}",
  eventDetailsHeading: "Деталі події",
  eventDate: "23 серпня 2026, 10:00",
  eventLocation: "Place du Luxembourg, Брюссель, Бельгія",
  footerText:
    "Цей лист надіслано European Resolve VZW як підтвердження твоєї реєстрації на 35 Years of 🇺🇦 Independence: Charity and Run.",
  footerUnsubscribe:
    "Цей лист надіслано, оскільки тебе зареєстровано на подію. Інших листів не буде надіслано за відсутності твоєї згоди на розсилку.",
  footerPaymentEmail:
    "Ти отримаєш ще один лист, коли твій платіж буде підтверджено.",
  fundraiserSubject:
    "35 Years of 🇺🇦 Independence: Charity and Run | Твою сторінку збору коштів створено!",
  fundraiserIntro:
    "Чудові новини, {name}! Тебе зареєстровано, і твоя персональна сторінка збору коштів вже працює. Поділися нею з друзями та рідними, щоб досягти своєї мети.",
  fundraiserHeading: "Твоя сторінка збору коштів",
  fundraiserPageLabel: "Поділися цим посиланням",
  fundraiserEditLabel: "Редагувати сторінку",
  fundraiserEditHint:
    "Збережи це посилання. Це єдиний спосіб редагувати твою сторінку збору коштів. Не поширюй його публічно.",
  fundraiserDisplayNameLabel: "Відображуване ім'я",
  fundraiserGoalLabel: "Особиста мета",
  paymentSubject:
    "35 Years of 🇺🇦 Independence: Charity and Run | Платіж підтверджено!",
  paymentIntro: "Твій донат отримано. Ось твоя підтверджена реєстрація:",
  paymentRewardsLabel: "Твої нагороди",
  paymentThankYou:
    "Дякуємо за підтримку захисників і захисниць України! Кожне євро фінансує зарядні станції на передовій.",
  paymentFooter:
    "Це твоє підтвердження платежу від European Resolve VZW за 35 Years of 🇺🇦 Independence: Charity and Run.",
  tierRewards: {
    supporter: { base: "Дізнайся, як твій донат допоміг", runnerOnly: "" },
    sprinter: { base: "Стікерпак", runnerOnly: "Біг" },
    "relay-runner": {
      base: "Стікерпак · Бігові шкарпетки · 1 лотерейний квиток",
      runnerOnly: "Біг",
    },
    marathoner: {
      base: "Стікерпак · Традиційний обід · 3 лотерейні квитки",
      runnerOnly: "Біг · Бігова футболка",
    },
    ultramarathoner: {
      base: "Стікерпак · Шовковий шарф від українського дизайнерського бренду · Традиційний обід · 5 лотерейних квитків",
      runnerOnly: "Біг",
    },
  },
};
