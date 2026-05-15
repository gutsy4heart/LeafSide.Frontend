import type { Book } from "../types/book";

export type AppLanguage = "ru" | "en" | "pl";

type LocalizedBook = Book & {
  displayTitle: string;
  displayAuthor: string;
  displayDescription: string;
  displayGenre: string;
  displayPublishing: string;
  displayLanguage: string;
};

const languageNames: Record<string, Record<AppLanguage, string>> = {
  Russian: { ru: "Русский", en: "Russian", pl: "Rosyjski" },
  English: { ru: "Английский", en: "English", pl: "Angielski" },
  Spanish: { ru: "Испанский", en: "Spanish", pl: "Hiszpański" },
  French: { ru: "Французский", en: "French", pl: "Francuski" },
  German: { ru: "Немецкий", en: "German", pl: "Niemiecki" },
  Italian: { ru: "Итальянский", en: "Italian", pl: "Włoski" },
  Portuguese: { ru: "Португальский", en: "Portuguese", pl: "Portugalski" },
  Chinese: { ru: "Китайский", en: "Chinese", pl: "Chiński" },
  Japanese: { ru: "Японский", en: "Japanese", pl: "Japoński" },
  Korean: { ru: "Корейский", en: "Korean", pl: "Koreański" },
  Arabic: { ru: "Арабский", en: "Arabic", pl: "Arabski" },
  Hindi: { ru: "Хинди", en: "Hindi", pl: "Hindi" },
  Other: { ru: "Другой", en: "Other", pl: "Inny" },
};

const genreNames: Record<string, Record<AppLanguage, string>> = {
  Fiction: { ru: "Художественная литература", en: "Fiction", pl: "Literatura piękna" },
  "Non-Fiction": { ru: "Нон-фикшн", en: "Non-Fiction", pl: "Literatura faktu" },
  Mystery: { ru: "Детектив", en: "Mystery", pl: "Kryminał" },
  Romance: { ru: "Романтика", en: "Romance", pl: "Romans" },
  "Science Fiction": { ru: "Научная фантастика", en: "Science Fiction", pl: "Science fiction" },
  Fantasy: { ru: "Фэнтези", en: "Fantasy", pl: "Fantasy" },
  Thriller: { ru: "Триллер", en: "Thriller", pl: "Thriller" },
  Biography: { ru: "Биография", en: "Biography", pl: "Biografia" },
  History: { ru: "История", en: "History", pl: "Historia" },
  "Self-Help": { ru: "Саморазвитие", en: "Self-Help", pl: "Poradnik" },
  Business: { ru: "Бизнес", en: "Business", pl: "Biznes" },
  Technology: { ru: "Технологии", en: "Technology", pl: "Technologia" },
  Art: { ru: "Искусство", en: "Art", pl: "Sztuka" },
  Poetry: { ru: "Поэзия", en: "Poetry", pl: "Poezja" },
  Drama: { ru: "Драма", en: "Drama", pl: "Dramat" },
  Comedy: { ru: "Комедия", en: "Comedy", pl: "Komedia" },
  Adventure: { ru: "Приключения", en: "Adventure", pl: "Przygoda" },
  Horror: { ru: "Ужасы", en: "Horror", pl: "Horror" },
  Philosophy: { ru: "Философия", en: "Philosophy", pl: "Filozofia" },
  Religion: { ru: "Религия", en: "Religion", pl: "Religia" },
  Education: { ru: "Образование", en: "Education", pl: "Edukacja" },
  Health: { ru: "Здоровье", en: "Health", pl: "Zdrowie" },
  Travel: { ru: "Путешествия", en: "Travel", pl: "Podróże" },
  Cooking: { ru: "Кулинария", en: "Cooking", pl: "Gotowanie" },
  Sports: { ru: "Спорт", en: "Sports", pl: "Sport" },
  Other: { ru: "Другое", en: "Other", pl: "Inne" },
};

const bookTranslations: Record<string, Record<AppLanguage, Partial<Book>>> = {
  "d83e7f02-9c54-4492-808e-cb5887f08864": {
    ru: {
      title: "IELTS 20. Практические тесты",
      description: "Официальные экзаменационные материалы Cambridge для подготовки к IELTS. В книге собраны практические тесты, которые помогают отработать формат экзамена и увереннее пройти все его части.",
      genre: "Образование",
      language: "Английский",
    },
    en: {
      title: "IELTS 20 Practice Test",
      description: "Authentic examination papers for the IELTS test. Prepare for the exam with official Cambridge practice tests, developed to help you understand the format and build confidence.",
      genre: "Education",
      language: "English",
    },
    pl: {
      title: "IELTS 20. Testy praktyczne",
      description: "Oficjalne materiały egzaminacyjne Cambridge do przygotowania do IELTS. Książka zawiera testy praktyczne, które pomagają poznać format egzaminu i pewniej przejść przez wszystkie jego części.",
      genre: "Edukacja",
      language: "Angielski",
    },
  },
};

function fieldFromLanguage(book: Book, field: "title" | "author" | "description" | "genre" | "publishing", language: AppLanguage) {
  const suffix = language === "ru" ? "Ru" : language === "pl" ? "Pl" : "En";
  return book[`${field}${suffix}` as keyof Book] as string | undefined;
}

function translatedField(book: Book, field: "title" | "author" | "description" | "genre" | "publishing" | "language", language: AppLanguage) {
  return book.translations?.[language]?.[field]
    || (field !== "language" ? fieldFromLanguage(book, field, language) : undefined)
    || bookTranslations[book.id]?.[language]?.[field]
    || book[field];
}

function translateDictionaryValue(value: string, dictionary: Record<string, Record<AppLanguage, string>>, language: AppLanguage) {
  return dictionary[value]?.[language] || value;
}

export function localizeBook(book: Book, language: AppLanguage): LocalizedBook {
  const genre = translatedField(book, "genre", language) || "";
  const bookLanguage = translatedField(book, "language", language) || "";

  return {
    ...book,
    displayTitle: translatedField(book, "title", language) || book.title,
    displayAuthor: translatedField(book, "author", language) || book.author,
    displayDescription: translatedField(book, "description", language) || book.description,
    displayGenre: translateDictionaryValue(genre, genreNames, language),
    displayPublishing: translatedField(book, "publishing", language) || book.publishing || "",
    displayLanguage: translateDictionaryValue(bookLanguage, languageNames, language),
  };
}
