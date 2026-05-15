import type { Review } from "../types/review";
import type { AppLanguage } from "./localized-book";

export type LocalizedReview = Review & {
  displayComment: string;
};

function commentFromLanguage(review: Review, language: AppLanguage) {
  if (language === "ru") return review.commentRu;
  if (language === "pl") return review.commentPl;
  return review.commentEn;
}

export function localizeReview(review: Review, language: AppLanguage): LocalizedReview {
  return {
    ...review,
    displayComment:
      review.translations?.[language]?.comment
      || commentFromLanguage(review, language)
      || review.comment
      || "",
  };
}
