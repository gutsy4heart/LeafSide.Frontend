"use client";

import { Review } from "../../types/review";
import { localizeReview } from "../../lib/localized-review";
import { useTranslations } from "../../lib/translations";
import RatingDisplay from "./RatingDisplay";

interface ReviewListProps {
  reviews: Review[];
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  currentUserId?: string;
}

export default function ReviewList({ 
  reviews, 
  onEdit, 
  onDelete, 
  currentUserId 
}: ReviewListProps) {
  const { t, language } = useTranslations();
  const dateLocales = {
    ru: "ru-RU",
    en: "en-US",
    pl: "pl-PL",
  } as const;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)]">
        {t("reviews.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const localizedReview = localizeReview(review, language);
        const isOwner = currentUserId === review.userId;
        const date = new Date(review.createdAt).toLocaleDateString(dateLocales[language], {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        return (
          <div
            key={review.id}
            className="card p-4 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-semibold">
                    {review.userName || t("reviews.anonymousUser")}
                  </div>
                  <RatingDisplay rating={review.rating} size="sm" />
                  <span className="text-sm text-[var(--muted)]">{date}</span>
                </div>
                {localizedReview.displayComment && (
                  <p className="text-[var(--foreground)] whitespace-pre-wrap">
                    {localizedReview.displayComment}
                  </p>
                )}
              </div>
              {isOwner && (onEdit || onDelete) && (
                <div className="flex gap-2 ml-4">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(review)}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {t("reviews.edit")}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(review.id)}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      {t("reviews.delete")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
