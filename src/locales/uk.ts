import type { Locale } from "./types";

export const uk = {
  // hero
  "hero.overline": "Благодійний забіг · Брюссель",
  "hero.title": "35 років Незалежності 🇺🇦: Благодійність і Забіг",
  "hero.description":
    "У неділю, 23 серпня, приєднуйся до нас, щоб відсвяткувати 35 років незалежності України! Ми розгорнемо прапор, пробіжимо разом 5 або 8 кілометрів, а потім буде їжа, друзі та благодійна лотерея. Наша велика мета - зібрати €3 000 разом з Hurkit, щоб забезпечити захисників і захисниць України надійним живленням у польових умовах - переглянь варіанти підтримки нижче і бери з собою знайомих!",
  "hero.beneficiary": "Бенефіціар:",

  // tracks
  "tracks.heading": "Обери свій напрямок",
  "tracks.subtitle":
    "Два шляхи підтримки, одна мета. Обери\u00a0свій\u00a0напрямок.",
  "tracks.trackAOverline": "Напрямок A",
  "tracks.trackATitle": "Приєднуйся до Кампанії",
  "tracks.trackADescription":
    "Обери рівень підтримки та зроби внесок напряму - біжи у день події або просто долучайся з будь-якого місця. Твій внесок фінансує зарядні станції для захисниць і захисників.",
  "tracks.trackAFeatures":
    "Рівень на вибір · Різні нагороди · Біг необов'язковий",
  "tracks.trackACta": "Переглянути рівні →",
  "tracks.trackBOverline": "Напрямок B",
  "tracks.trackBTitle": "Почни збір у нашій команді",
  "tracks.trackBDescription":
    "Створи персональну сторінку збору коштів і залучай знайомих. Кожен донат наближає до спільної мети, а потім - біжи з нами.",
  "tracks.trackBFeatures":
    "Персональна сторінка · Посилання для поширення · Статистика в реальному часі",
  "tracks.trackBCta": "Створити мою сторінку →",

  // progress
  "progress.overline": "Прогрес у реальному часі",
  "progress.indicator": "Оновлюється в реальному часі",
  "progress.raised": "Зібрано",
  "progress.goal": "Мета",
  "progress.participants": "Учасни_ці",
  "progress.donors": "Донори",
  "progress.barLabel": "€{raised} зібрано · Мета €{goal}",
  "progress.finalResults": "Фінальні результати",

  // register
  "register.overline": "Напрямок A · Приєднуйся до Кампанії",
  "register.title": "Обери рівень",
  "register.titleRegistration": "Реєстрація",
  "register.titleConfirmation": "Підтвердження",
  "register.subtitle":
    "Кожен рівень безпосередньо фінансує зарядні станції для захисниць і захисників України. Біжи у день події або просто підтримай кампанію з будь-якого місця.",
  "register.heading": "Твої дані",
  "register.descriptionSupporter": "Обери суму донату на наступній сторінці.",
  "register.descriptionRunner":
    "Пробіжи з нами 5 або 8 кілометрів 23 серпня. Ми надішлемо тобі інформацію про подію на електронну пошту.",
  "register.errorSummary": "Будь ласка, виправ наступне:",
  "register.firstName": "Ім'я",
  "register.lastName": "Прізвище",
  "register.email": "Електронна пошта",
  "register.tshirtSize": "Розмір футболки",
  "register.socksSize": "Розмір шкарпеток",
  "register.gdprHeading": "Згода GDPR (обов'язково)",
  "register.gdprRunner":
    "Я погоджуюся на обробку моїх даних з метою реєстрації на забіг та забезпечення безпеки, відповідно до повідомлення про конфіденційність.",
  "register.gdprSupporter":
    "Я погоджуюся на обробку моїх даних з метою реєстрації на подію та відстеження донатів, відповідно до повідомлення про конфіденційність.",
  "register.commsHeading": "Майбутні комунікації (необов'язково)",
  "register.commsText":
    "Надсилайте мені новини про наступні події та роботу бенефіціара. Я можу відписатися в будь-який момент.",
  "register.continue": "Продовжити",
  "register.submitting": "Реєстрація...",
  "register.failedFallback":
    "Реєстрація не вдалася. Будь ласка, спробуй ще раз.",
  "register.networkError":
    "Не вдалося з'єднатися з сервером реєстрації. Будь ласка, спробуй пізніше.",
  "register.errorFirstName": "Ім'я є обов'язковим",
  "register.errorLastName": "Прізвище є обов'язковим",
  "register.errorEmail": "Потрібна дійсна електронна адреса",
  "register.errorTshirt": "Розмір футболки є обов'язковим",
  "register.errorSocks": "Розмір шкарпеток є обов'язковим",
  "register.errorGdpr": "Згода GDPR є обов'язковою для реєстрації",
  "register.confirmHeading": "Твій запис створено!",
  "register.confirmParticipantId": "Твій ID: {id}",
  "register.confirmName": "Ім'я",
  "register.confirmTier": "Рівень",
  "register.confirmAmount": "Сума",
  "register.confirmRewardsHeading": "Твої нагороди",
  "register.confirmDonationHeading": "Заверши реєстрацію",
  "register.confirmDonationInstructions":
    "Будь ласка, нижче вкажи суму донату €{amount} або вищу, щоб завершити реєстрацію {tierName}.",
  "register.confirmAfterDonation": "Після завершення твого донату вище:",
  "register.confirmButton": "Донат надіслано",
  "register.confirmingPayment": "Підтвердження\u2026",
  "register.confirmedHeading": "Оплату отримано — дякуємо!",
  "register.confirmedRunner":
    "Твою реєстрацію завершено. Ти отримаєш подарунки на фініші.",
  "register.confirmedSupporter":
    "Дякуємо за твою підтримку! Ми поділимося результатами нашого збору електронним листом.",
  "register.confirmFailed": "Підтвердження не пройшло",
  "register.confirmNetworkError":
    "Не вдалося підтвердити оплату. Будь ласка, спробуй ще раз.",
  "register.interruptedSession":
    "Схоже, твою сесію було перервано. Якщо оплату було проведено, зв\u2019яжися з нами за адресою info@european-resolve.org з підтвердженням оплати, і ми власноруч завершимо твою реєстрацію.",
  "register.verifyingPayment": "Перевірка оплати\u2026",
  "register.needInvoice": "Потрібен рахунок?",
  "register.startOver": "Зареєструватися знову",
  "register.abandonRegistration": "Скасувати та розпочати реєстрацію знову",
  "register.alreadyPaidHeading": "Дякуємо, що ти з нами!",
  "register.alreadyPaidMessage":
    "Ми отримали твою оплату і будемо інформувати тебе про новини кампанії та події.",
  "register.alreadyPaidCta": "Повернутися на сторінку події",

  // tierCard
  "tierCard.badge": "Найпопулярніший",
  "tierCard.selected": "Обрано",
  "tierCard.select": "Обрати {tierName}",

  // fundraise
  "fundraise.overline": "Напрямок B · Почни збір у нашій команді",
  "fundraise.title": "Твоя сторінка збору коштів",
  "fundraise.subtitle":
    "Це займе приблизно хвилину. Поділися сторінкою з друзями та родиною, щоб досягти спільної мети - а потім біжи з нами!",
  "fundraise.step1": "1. Твоя сторінка",
  "fundraise.step2": "2. Дані бігун_ки",
  "fundraise.step3": "3. Перевірка",
  "fundraise.step1Heading": "Створи сторінку збору коштів",
  "fundraise.photoLabel": "+ Фото",
  "fundraise.displayName": "Відображуване ім'я",
  "fundraise.displayNamePlaceholder": "Як ти хочеш виглядати на своїй сторінці",
  "fundraise.personalMessage": "Особисте повідомлення",
  "fundraise.messagePlaceholder": "Чому ти біжиш? Що тебе мотивує?",
  "fundraise.goalLabel": "Особиста мета (€)",
  "fundraise.nextRunner": "Далі: Дані бігун)ки →",
  "fundraise.step2Heading": "Твоя реєстрація бігун_ки",
  "fundraise.firstName": "Ім'я",
  "fundraise.lastName": "Прізвище",
  "fundraise.email": "Електронна пошта",
  "fundraise.phone": "Телефон",
  "fundraise.tshirtSize": "Розмір футболки",
  "fundraise.language": "Мова",
  "fundraise.country": "Країна",
  "fundraise.gdprHeading": "Згода GDPR (обов'язково)",
  "fundraise.gdprText":
    "Я погоджуюся на обробку моїх даних з метою реєстрації на забіг та забезпечення безпеки, відповідно до повідомлення про конфіденційність.",
  "fundraise.commsHeading": "Майбутні комунікації (необов'язково)",
  "fundraise.commsText":
    "Надсилайте мені новини про наступні події та роботу бенефіціара.",
  "fundraise.back": "← Назад",
  "fundraise.nextReview": "Далі: Перевірка →",
  "fundraise.step3Heading": "Перевірити та надіслати",
  "fundraise.reviewPage": "Твоя сторінка збору коштів",
  "fundraise.reviewDisplayName": "Відображуване ім'я",
  "fundraise.reviewMessage": "Повідомлення",
  "fundraise.reviewGoal": "Мета",
  "fundraise.reviewPhoto": "Фото",
  "fundraise.reviewUploaded": "Завантажено",
  "fundraise.reviewNone": "Немає",
  "fundraise.reviewRegistration": "Реєстрація бігун_ки",
  "fundraise.reviewTier": "Рівень",
  "fundraise.reviewFullName": "Повне ім'я",
  "fundraise.reviewEmail": "Електронна пошта",
  "fundraise.reviewTshirt": "Футболка",
  "fundraise.reviewCountry": "Країна",
  "fundraise.submitButton": "Створити сторінку та зареєструватися — €{price}",
  "fundraise.submitting": "Створення\u2026",
  "fundraise.networkError":
    "Помилка мережі. Перевір з'єднання та спробуй ще раз.",
  "fundraise.globalError": "Щось пішло не так. Будь ласка, спробуй ще раз.",
  "fundraise.errorDisplayName":
    "Відображуване ім'я має містити від 2 до 50 символів",
  "fundraise.errorMessageRequired": "Повідомлення є обов'язковим",
  "fundraise.errorMessageLength": "Повідомлення має містити менше 500 символів",
  "fundraise.errorGoal": "Мета має бути цілим числом від 10 до 100 000",
  "fundraise.errorTier": "Будь ласка, обери рівень",
  "fundraise.errorFirstName": "Ім'я є обов'язковим",
  "fundraise.errorLastName": "Прізвище є обов'язковим",
  "fundraise.errorEmail": "Потрібна дійсна електронна адреса",
  "fundraise.errorCountry": "Країна є обов'язковою",
  "fundraise.errorGdpr": "Згода GDPR є обов'язковою для реєстрації",
  "fundraise.errorPhoto": "Фото має бути менше 5 МБ",
  "fundraise.errorPhotoType": "Фото має бути у форматі JPEG, PNG або WebP",

  // confirmation (FundraiserConfirmation)
  "confirmation.heading": "Твою сторінку збору коштів створено!",
  "confirmation.subheading": "Поділися сторінкою з друзями та сім'єю — {name}",
  "confirmation.shareableLink": "Твоє посилання для поширення",
  "confirmation.copy": "Копіювати",
  "confirmation.copied": "Скопійовано!",
  "confirmation.editLink": "Секретне посилання для редагування — збережи його!",
  "confirmation.editHint":
    "Це посилання дозволяє редагувати та публікувати твою сторінку. Тримай її в таємниці.",
  "confirmation.registrationHeading": "Реєстрація бігун_ки",
  "confirmation.participantId": "Твій ID: {id}",
  "confirmation.tier": "Рівень",
  "confirmation.amount": "Сума",
  "confirmation.rewardsHeading": "Твої нагороди",
  "confirmation.paymentHeading": "Заверши реєстрацію",
  "confirmation.paymentInstructions":
    "Будь ласка, нижче вкажи суму донату €{amount} або вищу, щоб завершити реєстрацію {tierName}.",
  "confirmation.afterDonation": "Після завершення твого донату вище:",
  "confirmation.confirmButton": "Донат надіслано",
  "confirmation.confirming": "Підтвердження\u2026",
  "confirmation.confirmed": "Оплату підтверджено — все готово!",
  "confirmation.confirmError":
    "Не вдалося підтвердити оплату. Будь ласка, спробуй ще раз.",
  "confirmation.confirmFailed": "Підтвердження не вдалося",
  "confirmation.interruptedSession":
    "Схоже, твою сесію було перервано. Якщо оплату було проведено, зв\u2019яжися з нами за адресою info@european-resolve.org з підтвердженням оплати, і ми власноруч завершимо твою реєстрацію.",
  "confirmation.verifyingPayment": "Перевірка оплати\u2026",
  "confirmation.viewPage": "Переглянути твою сторінку →",
  "confirmation.shareHeading": "Поділися твоєю сторінкою",

  // fundraiser (FundraiserPage)
  "fundraiser.notFoundHeading": "Сторінку збору коштів не знайдено",
  "fundraiser.notFoundText":
    "Ця сторінка збору коштів не існує або була видалена.",
  "fundraiser.createOwn": "Створити власну сторінку збору коштів →",
  "fundraiser.draftBanner":
    "Ця сторінка є чернеткою — лише автор_ка може її бачити",
  "fundraiser.nameSuffix": " — сторінка збору",
  "fundraiser.personalGoal": "Особиста мета: €{goal}",
  "fundraiser.raisedSoFar": "Зібрано: €{raised}",
  "fundraiser.collectiveTotal":
    "Частина спільної кампанії — €{total} зібрано разом",
  "fundraiser.donateHeading": "Зробити донат",
  "fundraiser.shareHeading": "Поділитися цією сторінкою",
  "fundraiser.ctaButton": "Підтримати {name}",
  "fundraiser.thankYouDonation": "Дякуємо за твій донат!",
  "fundraiser.manualConfirm": "Донат надіслано",
  "fundraiser.publishing": "Публікація\u2026",
  "fundraiser.publish": "Опублікувати цю сторінку",
  "fundraiser.edit": "Редагувати збір",
  "fundraiser.editMessage": "Твоє повідомлення",
  "fundraiser.editGoal": "Мета збору (€)",
  "fundraiser.save": "Зберегти зміни",
  "fundraiser.saving": "Збереження…",
  "fundraiser.saveFailed": "Не вдалося зберегти зміни",
  "fundraiser.cancel": "Скасувати",

  // donorWall
  "donorWall.heading": "Підтримка",
  "donorWall.empty": "Ще немає підтримки — будь першим/першою!",
  "donorWall.loading": "Завантаження\u2026",
  "donorWall.gateButton": "Я зроби_ла донат — залишити слово підтримки",
  "donorWall.nameLabel": "Твоє ім'я",
  "donorWall.namePlaceholder": "Як ти хочеш виглядати",
  "donorWall.messageLabel": "Твоє повідомлення",
  "donorWall.messagePlaceholder": "Слово підтримки...",
  "donorWall.posting": "Публікація\u2026",
  "donorWall.postButton": "Опублікувати на стіні",
  "donorWall.thankYou": "Дякуємо за твою підтримку!",
  "donorWall.privacyNotice":
    "Твоє ім'я та повідомлення будуть публічно видимі.",
  "donorWall.errorName": "Ім'я має містити від 2 до 50 символів",
  "donorWall.errorMessage": "Повідомлення має містити від 5 до 200 символів",
  "donorWall.networkError": "Помилка мережі. Будь ласка, спробуй ще раз.",
  "donorWall.globalError": "Щось пішло не так.",

  // event
  "event.coOrganisers": "Співорганізатори",

  // social
  "social.shareWhatsApp": "Поділитися в WhatsApp",
  "social.shareLinkedIn": "Поділитися в LinkedIn",
  "social.shareFacebook": "Поділитися в Facebook",
  "social.shareX": "Поділитися в X",
  "social.shareEmail": "Поділитися електронною поштою",
  "social.copyLink": "Копіювати посилання",
  "social.shareMessage":
    "Підтримай збір коштів {title} для 35 Years of 🇺🇦 Independence: Charity and Run! Кожне євро фінансує зарядні станції для захисників і захисниць України.",

  // common
  "common.loading": "Завантаження",
  "common.charCount": "{count}/{max}",
  "common.optional": "(необов'язково)",

  // closed (post-event mode)
  "closed.eventCompleted": "Подію завершено · 23 серпня 2026",
  "closed.thankYou":
    "Дякуємо всім бігун_кам і донор_кам, хто зробили це можливим!",
  "closed.registrationClosed": "Реєстрацію закрито",
  "closed.fundraiseClosed": "Створення збору коштів закрито",
  "closed.seeResults": "Переглянути результати події →",
  "closed.donationsClosed": "Донати закрито",
  "closed.finalResults": "Фінальні результати",
  "closed.galleryHeading": "Фото з події",
  "closed.accountabilityHeading": "Звіт про вплив",
  "closed.totalRaised": "Загальна сума зборів",
  "closed.chargingStations": "Зарядних станцій профінансовано",
  "closed.impactStatement":
    "Кожне зібране євро пішло безпосередньо до Hurkit, забезпечуючи зарядні станції для захисниць і захисників України.",

  // errors (backend error code mappings)
  "errors.VALIDATION_FIRSTNAME_REQUIRED": "Ім'я є обов'язковим",
  "errors.VALIDATION_LASTNAME_REQUIRED": "Прізвище є обов'язковим",
  "errors.VALIDATION_EMAIL_INVALID":
    "Будь ласка, введіть дійсну електронну адресу",
  "errors.VALIDATION_TSHIRT_INVALID": "Потрібен дійсний розмір футболки",
  "errors.VALIDATION_SOCKS_INVALID": "Потрібен дійсний розмір шкарпеток",
  "errors.VALIDATION_LANGUAGE_INVALID": "Потрібна дійсна мова",
  "errors.VALIDATION_COUNTRY_REQUIRED": "Країна є обов'язковою",
  "errors.VALIDATION_TIER_INVALID": "Потрібен дійсний рівень",
  "errors.VALIDATION_GDPR_REQUIRED": "Згода GDPR є обов'язковою для реєстрації",
  "errors.VALIDATION_PARTICIPATION_TYPE_REQUIRED": "Тип участі є обов'язковим",
  "errors.VALIDATION_DISPLAYNAME_LENGTH":
    "Відображуване ім'я має містити від 2 до 50 символів",
  "errors.VALIDATION_MESSAGE_REQUIRED": "Повідомлення є обов'язковим",
  "errors.VALIDATION_MESSAGE_LENGTH":
    "Повідомлення має містити менше 500 символів",
  "errors.VALIDATION_GOAL_INVALID":
    "Мета має бути цілим числом від 10 до 100 000",
  "errors.VALIDATION_PHOTO_TYPE": "Фото має бути у форматі JPEG, PNG або WebP",
  "errors.VALIDATION_PHOTO_SIZE": "Фото має бути менше 5 МБ",
  "errors.VALIDATION_STATUS_INVALID": "Недійсне значення статусу",
  "errors.VALIDATION_AUTH_REQUIRED": "Автентифікація є обов'язковою",
  "errors.VALIDATION_AUTH_INVALID": "Недійсний токен автентифікації",
  "errors.VALIDATION_DONOR_NAME_LENGTH":
    "Ім'я має містити від 2 до 50 символів",
  "errors.VALIDATION_DONOR_MESSAGE_LENGTH":
    "Повідомлення має містити від 5 до 200 символів",
  "errors.VALIDATION_SLUG_REQUIRED":
    "Ідентифікатор збору коштів є обов'язковим",
  "errors.VALIDATION_SLUG_NOT_FOUND": "Сторінку збору коштів не знайдено",
  "errors.INTERNAL_ERROR":
    "Сталася неочікувана помилка. Будь ласка, спробуй ще раз.",

  // nav (breadcrumbs)
  "nav.events": "Події",
  "nav.register": "Реєстрація",
  "nav.fundraise": "Збір коштів",
  "nav.fundraiser": "Сторінка збору",

  // feeBreakdown
  "feeBreakdown.overline": "Куди йдуть кошти",
  "feeBreakdown.cause": "на справу",
  "feeBreakdown.logistics": "логістика",
} satisfies Locale;
