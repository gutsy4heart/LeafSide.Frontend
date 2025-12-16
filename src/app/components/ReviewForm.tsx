"use client";

import { useState } from "react";
import RatingInput from "./RatingInput";
import { CreateReviewRequest, UpdateReviewRequest, Review } from "../../types/review";

interface ReviewFormProps {
  bookId: string;
  existingReview?: Review;
  onSubmit: (data: CreateReviewRequest | UpdateReviewRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function ReviewForm({
  bookId,
  existingReview,
  onSubmit,
  onCancel,
  isLoading = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Пожалуйста, выберите оценку");
      return;
    }

    try {
      if (existingReview) {
        await onSubmit({ rating, comment: comment || undefined } as UpdateReviewRequest);
      } else {
        await onSubmit({ bookId, rating, comment: comment || undefined } as CreateReviewRequest);
      }
      // Reset form if creating new review
      if (!existingReview) {
        setRating(0);
        setComment("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Ваша оценка *
        </label>
        <RatingInput
          value={rating}
          onChange={setRating}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Комментарий (необязательно)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isLoading}
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
          placeholder="Поделитесь своими впечатлениями о книге..."
        />
        <div className="text-xs text-[var(--muted)] mt-1 text-right">
          {comment.length} / 2000
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading || rating === 0}
          className="btn-accent flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Отправка..."
            : existingReview
            ? "Обновить отзыв"
            : "Оставить отзыв"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

