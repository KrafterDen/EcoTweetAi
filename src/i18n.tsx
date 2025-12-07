import React, { createContext, useContext, useMemo, useState } from "react";

type Locale = "en" | "uk";

type Translations = Record<Locale, Record<string, string>>;

const translations: Translations = {
  en: {},
  uk: {
    "nav.issues": "Проблеми",
    "nav.resources": "Ресурси",
    "nav.involved": "Долучитися",
    "nav.report": "Повідомити про проблему",
    "nav.reportMobile": "Запропонувати проблему",
    "hero.badge": "Виявлено критичні проблеми",
    "hero.title1": "Місце, де",
    "hero.title2": "вирішують",
    "hero.title3": "проблеми",
    "hero.subtitle":
      "EcoTweetAI об’єднує людей для розв’язання екологічних проблем. Дивіться, як світ об’єднується в реальному часі.",
    "hero.cta.primary": "Діяти",
    "hero.cta.secondary": "Зберегти планету",
    "highlights.problem": "Проблема тижня",
    "highlights.solution": "Рішення тижня",
    "highlights.hero": "Еко-герой",
    "highlights.impact": "Вплив спільноти",
    "highlights.suggestedBy": "Запропоновано",
    "highlights.proposedBy": "Запропоновано",
    "highlights.mostActive": "Найактивніший учасник",
    "highlights.issues": "Проблем",
    "highlights.sols": "Рішень",
    "highlights.votes": "Голосів",
    "highlights.newProblems": "Нові проблеми",
    "highlights.newSolutions": "Нові рішення",
    "highlights.votesCast": "Віддано голосів",
    "highlights.join": "Долучитися",
    "section.title": "Пріоритетні екологічні проблеми",
    "section.subtitle":
      "Ці взаємопов’язані екологічні кризи потребують термінової глобальної співпраці та дій.",
    "empty.title": "Немає даних для цієї локалізації",
    "empty.subtitle": "Спробуйте обрати інший регіон, щоб переглянути екологічні виклики.",
    "cta.title": "Кожна дія має значення",
    "cta.subtitle":
      "Хоча ці виклики серйозні, спільні дії та особисті рішення можуть змінити ситуацію. Будьте поінформовані, зменшуйте свій вплив та підтримуйте сталі ініціативи.",
    "cta.primary": "Долучитися",
    "cta.secondary": "Поділитися інформацією",
    "card.urgency": "Рівень терміновості",
    "card.population": "Постраждале населення",
    "card.timeframe": "Критичний термін",
    "card.takeAction": "Діяти!",
    "solutions.back": "Назад до всіх проблем",
    "solutions.community": "Рішення спільноти",
    "solutions.communitySub":
      "Діліться та відкривайте дієві рішення з усього світу",
    "solutions.noneTitle": "Ще немає запропонованих рішень",
    "solutions.noneSub": "Станьте першим, хто поділиться планом дій для цієї проблеми.",
    "solutions.placeholder": "Поділіться рішенням або ідеєю, щоб допомогти вирішити цю проблему...",
    "solutions.hint": "Натисніть Enter, щоб надіслати, Shift + Enter — новий рядок",
    "report.title": "Звіт про проблему",
    "report.subtitle": "Допоможіть нам виявляти та відстежувати екологічні загрози.",
    "report.problemTitle": "Назва проблеми",
    "report.description": "Опис",
    "report.image": "Зображення (URL або файл)",
    "report.imageHint": "Вставте посилання на зображення. Файли буде завантажено на сервер і використано як URL (без base64).",
    "report.location": "Локація",
    "report.regionPh": "Оберіть регіон",
    "report.countryPh": "Оберіть країну",
    "report.cityPh": "Оберіть місто",
    "report.selected": "Обрано",
    "report.noLocation": "Локація не вказана",
    "report.locationHint": "* Оберіть регіон та, за потреби, країну/місто для локалізації проблеми.",
    "report.affected": "Постраждалі люди",
    "report.affectedPh": "Орієнтовна кількість",
    "report.timeframe": "Критичний термін",
    "report.urgency": "Рівень терміновості",
    "report.tags": "Теги",
    "report.submit": "Надіслати звіт",
    "report.low": "Низький",
    "report.critical": "Критичний",
    "report.titlePh": "наприклад, Забруднення річки біля заводу",
    "report.descriptionPh": "Опишіть проблему детальніше...",
    "report.lead": "Допоможіть нам виявляти та відстежувати екологічні загрози.",
    "timeframe.5": "Наступні 5 років",
    "timeframe.10": "Наступні 10 років",
    "timeframe.15": "Наступні 15 років",
    "timeframe.20": "Наступні 20 років",
    "registration.title": "Анкета модератора контенту",
    "registration.subtitle": "Долучіться до команди волонтерів",
    "registration.fullName": "Повне ім’я",
    "registration.email": "Електронна пошта",
    "registration.phone": "Телефон",
    "registration.experience": "Досвід модерації",
    "registration.motivation": "Чому ви хочете бути модератором?",
    "registration.availability": "Щотижнева доступність (годин)",
    "registration.agree": "Я погоджуюся з умовами та правилами спільноти",
    "registration.submit": "Надіслати заявку",
    "activists.search": "Пошук за ім’ям або нікнеймом",
    "activists.all": "Усі регіони",
    "activists.emptyTitle": "Активісти за вашим фільтром відсутні",
    "activists.emptySub": "Спробуйте інший регіон або очистіть поле пошуку.",
    "resources.heading": "Лідери руху",
    "resources.title": "Глобальні екоактивісти",
    "resources.copy":
      "Дізнайтеся про науковців, організаторів, дипломатів та оповідачів, які ведуть боротьбу за кліматичну справедливість. Слідкуйте за ними, щоб посилити їхню роботу у своїй мережі.",
    "resources.back": "Назад на головну",
    "hero.live.name": "Прямий ефір",
  },
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>("uk");

  const t = (key: string, fallback?: string) => {
    const dict = translations[locale] || {};
    if (dict[key]) return dict[key];
    return fallback ?? translations.en[key] ?? key;
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
};
