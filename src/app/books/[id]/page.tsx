"use client";

import type { Book } from "@/types/book";
import { fetchJson } from "@/lib/api";
import { notFound } from "next/navigation";
import AddToCartButton from "./add-to-cart-button";
import FavoriteButton from "../../components/FavoriteButton";
import Link from "next/link";
import { useTranslations } from "../../../lib/translations";
import { useEffect, useState } from "react";
import ReviewList from "../../components/ReviewList";
import ReviewForm from "../../components/ReviewForm";
import RatingDisplay from "../../components/RatingDisplay";
import { Review, BookRating, CreateReviewRequest, UpdateReviewRequest } from "../../../types/review";
import { useAuth } from "../../auth-context";

type Props = { params: Promise<{ id: string }> };

export default function BookDetails({ params }: Props) {
  const { t } = useTranslations();
  const { isAuthenticated, userInfo, token } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<BookRating | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        const bookData = await fetchJson<Book>(`/api/books/${id}`);
        setBook(bookData);

        // Fetch reviews and rating
        const [reviewsData, ratingData] = await Promise.all([
          fetchJson<Review[]>(`/api/reviews/book/${id}`).catch(() => []),
          fetchJson<BookRating>(`/api/reviews/book/${id}/rating`).catch(() => null)
        ]);
        setReviews(reviewsData);
        setRating(ratingData);

        // Fetch user's review if authenticated
        if (isAuthenticated && token) {
          try {
            const response = await fetch(`/api/reviews/book/${id}/my`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
              const myReviewData = await response.json();
              setMyReview(myReviewData);
            }
          } catch {
            // User hasn't reviewed yet
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes(" 404")) {
          notFound();
        }
        setError(msg);
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    fetchData();
  }, [params, isAuthenticated, token]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--muted)]">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">{t('book.error')}</h1>
          <p className="text-[var(--muted)]">{error || t('book.notFound')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          ← {t('book.backToCatalog')}
        </Link>
      </div>
      
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 items-start">
        <div className="card p-6">
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-[var(--card)] mb-4 relative">
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton bookId={book.id} size="md" />
            </div>
            {book.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={book.imageUrl} 
                alt={book.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-lg">{t('book.imageNotAvailable')}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-[var(--foreground)] mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-[var(--muted)] mb-1">
              {t('book.author')}: <span className="font-medium">{book.author}</span>
            </p>
            {book.genre && (
              <p className="text-sm text-[var(--muted)]">
                {t('book.genre')}: <span className="font-medium">{book.genre}</span>
              </p>
            )}
            {book.publishing && (
              <p className="text-sm text-[var(--muted)]">
                {t('book.publisher')}: <span className="font-medium">{book.publishing}</span>
              </p>
            )}
          </div>
          
          {book.price != null && (
            <div className="py-4">
              <p className="text-3xl font-bold text-green-600">
                € {book.price.toFixed(2)}
              </p>
              {!book.isAvailable && (
                <p className="text-sm text-red-500 font-medium mt-2">
                  ⚠️ {t('book.temporarilyUnavailable')}
                </p>
              )}
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold mb-3">{t('book.description')}</h2>
            <p className="text-base leading-relaxed text-[var(--muted)]">
              {book.description || t('book.descriptionNotAvailable')}
            </p>
          </div>
          
          <div className="pt-4">
            <AddToCartButton bookId={book.id} bookTitle={book.title} isAvailable={book.isAvailable} />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Отзывы и рейтинги</h2>
          {rating && (
            <div className="flex items-center gap-4">
              <RatingDisplay rating={rating.averageRating} size="lg" showValue />
              <span className="text-[var(--muted)]">
                {rating.reviewCount} {rating.reviewCount === 1 ? "отзыв" : rating.reviewCount < 5 ? "отзыва" : "отзывов"}
              </span>
            </div>
          )}
        </div>

        {/* Review Form */}
        {isAuthenticated && !myReview && !isEditingReview && (
          <ReviewForm
            bookId={book.id}
            onSubmit={async (data) => {
              setIsSubmittingReview(true);
              try {
                if (!token) throw new Error("Не авторизован");
                const response = await fetch("/api/reviews", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error("Не удалось создать отзыв");
                const newReview = await response.json();
                setMyReview(newReview);
                // Refresh rating
                const ratingData = await fetchJson<BookRating>(`/api/reviews/book/${book.id}/rating`);
                setRating(ratingData);
              } finally {
                setIsSubmittingReview(false);
              }
            }}
            isLoading={isSubmittingReview}
          />
        )}

        {isAuthenticated && myReview && !isEditingReview && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Ваш отзыв</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingReview(true)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Редактировать
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Удалить отзыв?")) {
                      try {
                        if (!token) throw new Error("Не авторизован");
                        await fetch(`/api/reviews/${myReview.id}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setMyReview(null);
                        const [reviewsData, ratingData] = await Promise.all([
                          fetchJson<Review[]>(`/api/reviews/book/${book.id}`),
                          fetchJson<BookRating>(`/api/reviews/book/${book.id}/rating`)
                        ]);
                        setReviews(reviewsData);
                        setRating(ratingData);
                      } catch (err) {
                        alert("Не удалось удалить отзыв");
                      }
                    }
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Удалить
                </button>
              </div>
            </div>
            <RatingDisplay rating={myReview.rating} size="sm" />
            {myReview.comment && (
              <p className="mt-2 text-[var(--foreground)]">{myReview.comment}</p>
            )}
            {!myReview.isApproved && (
              <p className="mt-2 text-sm text-yellow-400">Ожидает модерации</p>
            )}
          </div>
        )}

        {isAuthenticated && isEditingReview && myReview && (
          <ReviewForm
            bookId={book.id}
            existingReview={myReview}
            onSubmit={async (data) => {
              setIsSubmittingReview(true);
              try {
                if (!token) throw new Error("Не авторизован");
                const response = await fetch(`/api/reviews/${myReview.id}`, {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error("Не удалось обновить отзыв");
                const updatedReview = await response.json();
                setMyReview(updatedReview);
                setIsEditingReview(false);
              } finally {
                setIsSubmittingReview(false);
              }
            }}
            onCancel={() => setIsEditingReview(false)}
            isLoading={isSubmittingReview}
          />
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="text-center py-8 text-[var(--muted)]">Загрузка отзывов...</div>
        ) : (
          <ReviewList
            reviews={reviews}
            currentUserId={userInfo?.id}
            onEdit={(review) => {
              setMyReview(review);
              setIsEditingReview(true);
            }}
            onDelete={async (reviewId) => {
              if (confirm("Удалить отзыв?")) {
                try {
                  if (!token) throw new Error("Не авторизован");
                  await fetch(`/api/reviews/${reviewId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const [reviewsData, ratingData] = await Promise.all([
                    fetchJson<Review[]>(`/api/reviews/book/${book.id}`),
                    fetchJson<BookRating>(`/api/reviews/book/${book.id}/rating`)
                  ]);
                  setReviews(reviewsData);
                  setRating(ratingData);
                  if (myReview?.id === reviewId) {
                    setMyReview(null);
                  }
                } catch (err) {
                  alert("Не удалось удалить отзыв");
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}


