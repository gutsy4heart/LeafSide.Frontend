"use client";

import { Review } from "../../types/review";
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
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)]">
        Пока нет отзывов. Будьте первым!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwner = currentUserId === review.userId;
        const date = new Date(review.createdAt).toLocaleDateString("ru-RU", {
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
                    {review.userName || "Анонимный пользователь"}
                  </div>
                  <RatingDisplay rating={review.rating} size="sm" />
                  <span className="text-sm text-[var(--muted)]">{date}</span>
                </div>
                {review.comment && (
                  <p className="text-[var(--foreground)] whitespace-pre-wrap">
                    {review.comment}
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
                      Редактировать
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(review.id)}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Удалить
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

