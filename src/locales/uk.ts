import type { Locale } from "./types";

export const uk = {
  // hero
  "hero.overline": "Благодійний забіг · Брюссель",
  "hero.beneficiary": "Бенефіціар:",

  // tracks
  "tracks.heading": "Оберіть свій напрямок",
  "tracks.subtitle":
    "Два шляхи підтримки, одна мета. Оберіть\u00a0свій\u00a0напрямок.",
  "tracks.trackAOverline": "Напрямок A",
  "tracks.trackATitle": "Донат або Біг",
  "tracks.trackADescription":
    "Оберіть рівень і зробіть внесок напряму — біжіть у день події або просто підтримайте з будь-якого місця. Ваш внесок фінансує зарядні станції для захисників.",
  "tracks.trackAFeatures": "Стартовий номер · Медаль фінішера · Футболка",
  "tracks.trackACta": "Переглянути рівні →",
  "tracks.trackBOverline": "Напрямок B",
  "tracks.trackBTitle": "Збір коштів і Біг",
  "tracks.trackBDescription":
    "Створіть персональну сторінку збору коштів і залучіть свою мережу. Кожен донат наближає до спільної мети — а потім вийдіть на старт.",
  "tracks.trackBFeatures":
    "Персональна сторінка · Посилання для поширення · Статистика в реальному часі",
  "tracks.trackBCta": "Створити мою сторінку →",

  // progress
  "progress.overline": "Прогрес у реальному часі",
  "progress.indicator": "Оновлюється в реальному часі",
  "progress.raised": "Зібрано",
  "progress.goal": "Мета",
  "progress.participants": "Учасники",
  "progress.donors": "Донори",
  "progress.barLabel": "€{raised} зібрано · Мета €{goal}",
  "progress.finalResults": "Фінальні результати",

  // register
  "register.overline": "Напрямок A · Донат або Біг",
  "register.title": "Оберіть рівень",
  "register.subtitle":
    "Кожен рівень безпосередньо фінансує зарядні станції для захисників України. Біжіть у день події або просто підтримайте з будь-якого місця.",
  "register.heading": "Ваші дані",
  "register.howParticipate": "Як ви плануєте брати участь?",
  "register.runOnDay": "Я побіжу в день події",
  "register.supportAnywhere": "Я підтримаю з будь-якого місця",
  "register.errorSummary": "Будь ласка, виправте наступне:",
  "register.fullName": "Повне ім'я",
  "register.email": "Електронна пошта",
  "register.phone": "Телефон",
  "register.tshirtSize": "Розмір футболки",
  "register.language": "Мова",
  "register.country": "Країна",
  "register.optional": "(необов'язково)",
  "register.gdprHeading": "Згода GDPR (обов'язково)",
  "register.gdprRunner":
    "Я погоджуюсь на обробку моїх даних з метою реєстрації на забіг та забезпечення безпеки, відповідно до повідомлення про конфіденційність.",
  "register.gdprSupporter":
    "Я погоджуюсь на обробку моїх даних з метою реєстрації на подію та відстеження донатів, відповідно до повідомлення про конфіденційність.",
  "register.commsHeading": "Майбутні комунікації (необов'язково)",
  "register.commsText":
    "Надсилайте мені новини про наступні події та роботу бенефіціара. Я можу відписатися в будь-який момент.",
  "register.total": "Всього: €{price}",
  "register.totalEmpty": "Всього: €—",
  "register.submitRunner": "Зареєструватися — €{price}",
  "register.submitSupporter": "Підтримати — €{price}",
  "register.submitting": "Реєстрація...",
  "register.selectTier": "Оберіть рівень для реєстрації",
  "register.failedFallback":
    "Реєстрація не вдалася. Будь ласка, спробуйте ще раз.",
  "register.networkError":
    "Не вдалося з'єднатися з сервером реєстрації. Будь ласка, спробуйте пізніше.",
  "register.errorFullName": "Повне ім'я є обов'язковим",
  "register.errorEmail": "Потрібна дійсна електронна адреса",
  "register.errorTshirt": "Розмір футболки є обов'язковим",
  "register.errorCountry": "Країна є обов'язковою",
  "register.errorGdpr": "Згода GDPR є обов'язковою для реєстрації",
  "register.confirmHeading": "Реєстрацію підтверджено!",
  "register.confirmParticipantId": "Ваш ID: {id}",
  "register.confirmName": "Ім'я",
  "register.confirmTier": "Рівень",
  "register.confirmAmount": "Сума",
  "register.confirmRewardsHeading": "Ваші нагороди",
  "register.confirmDonationHeading": "Завершіть ваш донат €{amount}",
  "register.confirmDonationInstructions":
    "Будь ласка, оберіть опцію €{amount} нижче, щоб завершити реєстрацію {tierName}.",
  "register.confirmAfterDonation": "Після завершення вашого донату вище:",
  "register.confirmButton": "Я завершив свій донат",
  "register.confirmingPayment": "Підтвердження\u2026",
  "register.confirmedHeading": "Оплату отримано — дякуємо!",
  "register.confirmedRunner":
    "Вашу реєстрацію завершено. Ви отримаєте матеріали для забігу на події.",
  "register.confirmedSupporter":
    "Дякуємо за вашу підтримку здалеку! Ви отримаєте цифровий сертифікат на електронну пошту.",
  "register.confirmFailed": "Підтвердження не вдалося",
  "register.confirmNetworkError":
    "Не вдалося підтвердити оплату. Будь ласка, спробуйте ще раз.",
  "register.interruptedSession":
    "Схоже, вашу сесію було перервано. Якщо ви вже завершили оплату, зв\u2019яжіться з нами за адресою info@european-resolve.org з підтвердженням оплати, і ми оновимо вашу реєстрацію.",
  "register.verifyingPayment": "Перевірка оплати\u2026",
  "register.needInvoice": "Потрібен рахунок?",
  "register.startOver": "Зареєструватися знову",

  // tierCard
  "tierCard.badge": "Найпопулярніший",
  "tierCard.selected": "Обрано",
  "tierCard.select": "Обрати",

  // fundraise
  "fundraise.overline": "Напрямок B · Збір коштів і Біг",
  "fundraise.title": "Ваша сторінка збору коштів",
  "fundraise.subtitle":
    "Це займе приблизно хвилину. Поділіться сторінкою з друзями та родиною, щоб досягти спільної мети — а потім вийдіть на старт.",
  "fundraise.step1": "1. Ваша сторінка",
  "fundraise.step2": "2. Дані бігуна",
  "fundraise.step3": "3. Перевірка",
  "fundraise.step1Heading": "Створіть сторінку збору коштів",
  "fundraise.photoLabel": "+ Фото",
  "fundraise.displayName": "Відображуване ім'я",
  "fundraise.displayNamePlaceholder":
    "Як ви хочете виглядати на своїй сторінці",
  "fundraise.personalMessage": "Особисте повідомлення",
  "fundraise.messagePlaceholder":
    "Чому ви біжите? Що вас мотивує?",
  "fundraise.goalLabel": "Особиста мета (€)",
  "fundraise.nextRunner": "Далі: Дані бігуна →",
  "fundraise.step2Heading": "Ваша реєстрація бігуна",
  "fundraise.fullName": "Повне ім'я",
  "fundraise.email": "Електронна пошта",
  "fundraise.phone": "Телефон",
  "fundraise.tshirtSize": "Розмір футболки",
  "fundraise.language": "Мова",
  "fundraise.country": "Країна",
  "fundraise.gdprHeading": "Згода GDPR (обов'язково)",
  "fundraise.gdprText":
    "Я погоджуюсь на обробку моїх даних з метою реєстрації на забіг та забезпечення безпеки, відповідно до повідомлення про конфіденційність.",
  "fundraise.commsHeading": "Майбутні комунікації (необов'язково)",
  "fundraise.commsText":
    "Надсилайте мені новини про наступні події та роботу бенефіціара.",
  "fundraise.back": "← Назад",
  "fundraise.nextReview": "Далі: Перевірка →",
  "fundraise.step3Heading": "Перевірити та надіслати",
  "fundraise.reviewPage": "Ваша сторінка збору коштів",
  "fundraise.reviewDisplayName": "Відображуване ім'я",
  "fundraise.reviewMessage": "Повідомлення",
  "fundraise.reviewGoal": "Мета",
  "fundraise.reviewPhoto": "Фото",
  "fundraise.reviewUploaded": "Завантажено",
  "fundraise.reviewNone": "Немає",
  "fundraise.reviewRegistration": "Реєстрація бігуна",
  "fundraise.reviewTier": "Рівень",
  "fundraise.reviewFullName": "Повне ім'я",
  "fundraise.reviewEmail": "Електронна пошта",
  "fundraise.reviewTshirt": "Футболка",
  "fundraise.reviewCountry": "Країна",
  "fundraise.submitButton": "Створити сторінку та зареєструватися — €{price}",
  "fundraise.submitting": "Створення\u2026",
  "fundraise.networkError":
    "Помилка мережі. Перевірте з'єднання та спробуйте ще раз.",
  "fundraise.globalError":
    "Щось пішло не так. Будь ласка, спробуйте ще раз.",
  "fundraise.errorDisplayName":
    "Відображуване ім'я має містити від 2 до 50 символів",
  "fundraise.errorMessageRequired": "Повідомлення є обов'язковим",
  "fundraise.errorMessageLength":
    "Повідомлення має містити менше 500 символів",
  "fundraise.errorGoal":
    "Мета має бути цілим числом від 10 до 100 000",
  "fundraise.errorTier": "Будь ласка, оберіть рівень",
  "fundraise.errorFullName": "Повне ім'я є обов'язковим",
  "fundraise.errorEmail": "Потрібна дійсна електронна адреса",
  "fundraise.errorCountry": "Країна є обов'язковою",
  "fundraise.errorGdpr": "Згода GDPR є обов'язковою для реєстрації",
  "fundraise.errorPhoto": "Фото має бути менше 5 МБ",
  "fundraise.errorPhotoType": "Фото має бути у форматі JPEG, PNG або WebP",

  // confirmation (FundraiserConfirmation)
  "confirmation.heading": "Вашу сторінку збору коштів створено!",
  "confirmation.subheading":
    "Поділіться сторінкою з друзями та родиною — {name}",
  "confirmation.shareableLink": "Ваше посилання для поширення",
  "confirmation.copy": "Копіювати",
  "confirmation.copied": "Скопійовано!",
  "confirmation.editLink":
    "Секретне посилання для редагування — збережіть його!",
  "confirmation.editHint":
    "Це посилання дозволяє редагувати та публікувати вашу сторінку. Тримайте його в таємниці.",
  "confirmation.registrationHeading": "Реєстрація бігуна",
  "confirmation.participantId": "Ваш ID: {id}",
  "confirmation.tier": "Рівень",
  "confirmation.amount": "Сума",
  "confirmation.rewardsHeading": "Ваші нагороди",
  "confirmation.paymentHeading": "Завершіть ваш донат €{amount}",
  "confirmation.paymentInstructions":
    "Оберіть опцію €{amount} нижче, щоб завершити реєстрацію {tierName}.",
  "confirmation.afterDonation": "Після завершення вашого донату вище:",
  "confirmation.confirmButton": "Я завершив свій донат",
  "confirmation.confirming": "Підтвердження\u2026",
  "confirmation.confirmed": "Оплату підтверджено — все готово!",
  "confirmation.confirmError":
    "Не вдалося підтвердити оплату. Будь ласка, спробуйте ще раз.",
  "confirmation.confirmFailed": "Підтвердження не вдалося",
  "confirmation.interruptedSession":
    "Схоже, вашу сесію було перервано. Якщо ви вже завершили оплату, зв\u2019яжіться з нами за адресою info@european-resolve.org з підтвердженням оплати, і ми оновимо вашу реєстрацію.",
  "confirmation.verifyingPayment": "Перевірка оплати\u2026",
  "confirmation.viewPage": "Переглянути вашу сторінку →",
  "confirmation.shareHeading": "Поділіться вашою сторінкою",

  // fundraiser (FundraiserPage)
  "fundraiser.notFoundHeading": "Сторінку збору коштів не знайдено",
  "fundraiser.notFoundText":
    "Ця сторінка збору коштів не існує або була видалена.",
  "fundraiser.createOwn": "Створити власну сторінку збору коштів →",
  "fundraiser.draftBanner":
    "Ця сторінка є чернеткою — лише автор може її бачити",
  "fundraiser.nameSuffix": " — сторінка збору",
  "fundraiser.personalGoal": "Особиста мета: €{goal}",
  "fundraiser.raisedSoFar": "Зібрано: €{raised}",
  "fundraiser.collectiveTotal": "Загальна сума: €{total}",
  "fundraiser.donateHeading": "Зробити донат",
  "fundraiser.shareHeading": "Поділитися цією сторінкою",
  "fundraiser.ctaButton": "Підтримати {name}",
  "fundraiser.thankYouDonation": "Дякуємо за ваш донат!",
  "fundraiser.manualConfirm": "Я завершив донат",
  "fundraiser.publishing": "Публікація\u2026",
  "fundraiser.publish": "Опублікувати цю сторінку",
  "fundraiser.edit": "Редагувати збір",
  "fundraiser.editMessage": "Ваше повідомлення",
  "fundraiser.editGoal": "Мета збору (€)",
  "fundraiser.save": "Зберегти зміни",
  "fundraiser.saving": "Збереження…",
  "fundraiser.saveFailed": "Не вдалося зберегти зміни",
  "fundraiser.cancel": "Скасувати",

  // donorWall
  "donorWall.heading": "Підтримка",
  "donorWall.empty": "Ще немає підтримки — будьте першими!",
  "donorWall.loading": "Завантаження\u2026",
  "donorWall.gateButton":
    "Я зробив донат — залишити слово підтримки",
  "donorWall.nameLabel": "Ваше ім'я",
  "donorWall.namePlaceholder": "Як ви хочете виглядати",
  "donorWall.messageLabel": "Ваше повідомлення",
  "donorWall.messagePlaceholder": "Слово підтримки...",
  "donorWall.posting": "Публікація\u2026",
  "donorWall.postButton": "Опублікувати на стіні",
  "donorWall.thankYou": "Дякуємо за вашу підтримку!",
  "donorWall.privacyNotice":
    "Ваше ім'я та повідомлення будуть публічно видимі.",
  "donorWall.errorName": "Ім'я має містити від 2 до 50 символів",
  "donorWall.errorMessage":
    "Повідомлення має містити від 5 до 200 символів",
  "donorWall.networkError":
    "Помилка мережі. Будь ласка, спробуйте ще раз.",
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
    "Підтримайте збір коштів {title} для Run for Ukraine 2026! Кожне євро фінансує зарядні станції для захисників України.",

  // common
  "common.loading": "Завантаження",
  "common.charCount": "{count}/{max}",
  "common.optional": "(необов'язково)",

  // closed (post-event mode)
  "closed.eventCompleted": "Подію завершено · 23 серпня 2026",
  "closed.thankYou":
    "Дякуємо кожному бігуну, донору та підтримувачу, хто зробив це можливим.",
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
    "Кожне зібране євро пішло безпосередньо до Hurkit, забезпечуючи зарядні станції для захисників України.",

  // errors (backend error code mappings)
  "errors.VALIDATION_FULLNAME_REQUIRED": "Повне ім'я є обов'язковим",
  "errors.VALIDATION_EMAIL_INVALID":
    "Будь ласка, введіть дійсну електронну адресу",
  "errors.VALIDATION_TSHIRT_INVALID":
    "Потрібен дійсний розмір футболки",
  "errors.VALIDATION_LANGUAGE_INVALID": "Потрібна дійсна мова",
  "errors.VALIDATION_COUNTRY_REQUIRED": "Країна є обов'язковою",
  "errors.VALIDATION_TIER_INVALID": "Потрібен дійсний рівень",
  "errors.VALIDATION_GDPR_REQUIRED":
    "Згода GDPR є обов'язковою для реєстрації",
  "errors.VALIDATION_PARTICIPATION_TYPE_REQUIRED":
    "Тип участі є обов'язковим",
  "errors.VALIDATION_DISPLAYNAME_LENGTH":
    "Відображуване ім'я має містити від 2 до 50 символів",
  "errors.VALIDATION_MESSAGE_REQUIRED": "Повідомлення є обов'язковим",
  "errors.VALIDATION_MESSAGE_LENGTH":
    "Повідомлення має містити менше 500 символів",
  "errors.VALIDATION_GOAL_INVALID":
    "Мета має бути цілим числом від 10 до 100 000",
  "errors.VALIDATION_PHOTO_TYPE":
    "Фото має бути у форматі JPEG, PNG або WebP",
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
    "Сталася неочікувана помилка. Будь ласка, спробуйте ще раз.",

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
