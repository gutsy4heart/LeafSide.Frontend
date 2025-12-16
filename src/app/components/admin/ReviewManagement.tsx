"use client";

import { Review } from "../../../types/review";
import RatingDisplay from "../RatingDisplay";
import { fetchJson } from "../../../lib/api";

interface ReviewManagementProps {
  reviews: Review[];
  loading: boolean;
  onApprove: (reviewId: string) => Promise<void>;
  onReject: (reviewId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function ReviewManagement({
  reviews,
  loading,
  onApprove,
  onReject,
  onRefresh
}: ReviewManagementProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-[var(--muted)]">Загрузка отзывов...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        Нет отзывов, ожидающих модерации
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const date = new Date(review.createdAt).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        return (
          <div key={review.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-semibold">
                    {review.userName || "Анонимный пользователь"}
                  </div>
                  <RatingDisplay rating={review.rating} size="sm" />
                  <span className="text-sm text-[var(--muted)]">{date}</span>
                </div>
                <div className="text-sm text-[var(--muted)] mb-2">
                  Книга ID: {review.bookId}
                </div>
                {review.comment && (
                  <p className="text-[var(--foreground)] whitespace-pre-wrap bg-[var(--background)] p-3 rounded-lg">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => onApprove(review.id)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Одобрить
              </button>
              <button
                onClick={() => onReject(review.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Отклонить
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

