"use client";

import { useFavorites } from "../favorites-context";
import { useAuth } from "../auth-context";
import { useTranslations } from "../../lib/translations";
import { localizeBook } from "../../lib/localized-book";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "../components/FavoriteButton";
import { useCart } from "../cart-context";

export default function FavoritesPage() {
  const { favorites, loading: favoritesLoading, error: favoritesError, clear } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { t, language } = useTranslations();
  const { add: addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "title" | "price">("newest");

  const visibleFavorites = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = favorites.filter((favorite) => {
      const book = favorite.book;
      if (!book) return false;
      if (!normalizedQuery) return true;
      const localizedBook = localizeBook(book, language);

      return [localizedBook.displayTitle, localizedBook.displayAuthor, localizedBook.displayGenre, localizedBook.displayLanguage]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "title") {
        return (a.book ? localizeBook(a.book, language).displayTitle : "").localeCompare(
          b.book ? localizeBook(b.book, language).displayTitle : ""
        );
      }

      if (sortBy === "price") {
        return (a.book?.price ?? 0) - (b.book?.price ?? 0);
      }

      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [favorites, query, sortBy, language]);

  const unavailableCount = useMemo(() => {
    return favorites.filter((favorite) => favorite.book && !favorite.book.isAvailable).length;
  }, [favorites]);

  const handleAddToCart = async (bookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(bookId);
    try {
      await addToCart(bookId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm(t('favorites.clearConfirm'))) {
      return;
    }

    setClearing(true);
    try {
      await clear();
    } finally {
      setClearing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('favorites.loginRequired')}</h1>
          <Link href="/login" className="text-blue-600 hover:underline">
            {t('navigation.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (favoritesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>{t('common.loading') || 'Загрузка...'}</p>
        </div>
      </div>
    );
  }

  if (favoritesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            {t('favorites.error')}
          </h1>
          <p className="text-[var(--muted)]">{favoritesError}</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 1 1 5.656 5.656L10 17.657l-6.828-6.829a4 4 0 0 1 0-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {t('favorites.empty')}
          </h1>
          <p className="text-[var(--muted)] mb-6">
            {t('favorites.emptyDescription')}
          </p>
          <Link 
            href="/" 
            className="inline-block bg-[var(--accent)] text-white px-6 py-3 rounded-md hover:bg-[var(--accent)]/80 transition-colors"
          >
            {t('favorites.browseBooks')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('favorites.title')}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
              <span>{t('favorites.count')}: {favorites.length}</span>
              <span>{t('favorites.available')}: {favorites.length - unavailableCount}</span>
              {unavailableCount > 0 && <span>{t('favorites.unavailable')}: {unavailableCount}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <span className="sr-only">{t('favorites.searchLabel')}</span>
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
              </svg>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('favorites.search')}
                className="h-10 w-full rounded-md border border-white/15 bg-[var(--card)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-blue-500 sm:w-64"
              />
            </label>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "newest" | "title" | "price")}
              className="h-10 rounded-md border border-white/15 bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-blue-500"
            >
              <option value="newest">{t('favorites.sortNewest')}</option>
              <option value="title">{t('favorites.sortTitle')}</option>
              <option value="price">{t('favorites.sortPrice')}</option>
            </select>

            <button
              type="button"
              onClick={handleClear}
              disabled={clearing}
              className="h-10 rounded-md border border-red-500/40 px-4 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {clearing ? t('favorites.clearing') : t('favorites.clear')}
            </button>
          </div>
        </div>

        {visibleFavorites.length === 0 ? (
          <div className="rounded-lg border border-white/10 py-16 text-center">
            <h2 className="text-xl font-semibold mb-2">{t('favorites.nothingFound')}</h2>
            <p className="text-[var(--muted)]">{t('favorites.nothingFoundDescription')}</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleFavorites.map((favorite) => {
            const book = favorite.book;
            if (!book) return null;
            const localizedBook = localizeBook(book, language);

            return (
            <div
              key={book.id}
              className="card p-4 block hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 group"
            >
              <Link href={`/books/${book.id}`} className="block">
                <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-[var(--card)] relative group/image">
                  {book.imageUrl ? (
                    <Image
                      src={book.imageUrl}
                      alt={localizedBook.displayTitle}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">{t('book.noImage') || 'Нет изображения'}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 z-10">
                    <FavoriteButton bookId={book.id} size="sm" />
                  </div>
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                    {new Date(favorite.createdAt).toLocaleDateString()}
                  </div>
                  {!book.isAvailable && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                      {t('book.unavailable') || 'Недоступно'}
                    </div>
                  )}
                </div>
                
                <h2 className="font-medium leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {localizedBook.displayTitle}
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">{localizedBook.displayAuthor}</p>
                {book.price != null && (
                  <p className="mt-2 font-semibold text-green-600">
                    € {book.price.toFixed(2)}
                  </p>
                )}
              </Link>
              
              {/* Add to cart button */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={(e) => handleAddToCart(book.id, e)}
                  disabled={addingToCart === book.id || !book.isAvailable}
                  className={`w-full py-2 px-3 rounded-md transition-colors text-sm font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    !book.isAvailable
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : addingToCart === book.id
                      ? 'bg-[var(--accent)]/50 text-white'
                      : 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80'
                  }`}
                >
                  {addingToCart === book.id ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('book.adding') || 'Добавление'}...
                    </>
                  ) : !book.isAvailable ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('book.unavailable') || 'Недоступно'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 16a2 2 0 104 0 2 2 0 00-4 0m8 0a2 2 0 104 0 2 2 0 00-4 0" />
                      </svg>
                      {t('book.addToCart') || 'В корзину'}
                    </>
                  )}
                </button>
              </div>
            </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
