"use client";

import { useFavorites } from "../favorites-context";
import { useAuth } from "../auth-context";
import { useTranslations } from "../../lib/translations";
import { useEffect, useState } from "react";
import { Book } from "../../types/book";
import { fetchJson } from "../../lib/api";
import Link from "next/link";
import FavoriteButton from "../components/FavoriteButton";
import { useCart } from "../cart-context";

export default function FavoritesPage() {
  const { favorites, loading: favoritesLoading, error: favoritesError } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslations();
  const { add: addToCart } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Загружаем данные книг для отображения
  useEffect(() => {
    const fetchBooks = async () => {
      if (!isAuthenticated || favorites.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Получаем все книги
        const allBooks = await fetchJson<Book[]>("/api/books");
        
        // Фильтруем только те книги, которые есть в избранном
        const favoriteBookIds = favorites.map(fav => fav.bookId);
        const favoriteBooks = allBooks.filter(book => favoriteBookIds.includes(book.id));
        
        // Сортируем по дате добавления в избранное (новые первыми)
        const sortedBooks = favoriteBooks.sort((a, b) => {
          const aDate = favorites.find(f => f.bookId === a.id)?.createdAt || "";
          const bDate = favorites.find(f => f.bookId === b.id)?.createdAt || "";
          return bDate.localeCompare(aDate);
        });
        
        setBooks(sortedBooks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки книг');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [favorites, isAuthenticated]);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('favorites.loginRequired') || 'Необходимо войти'}</h1>
          <Link href="/login" className="text-blue-600 hover:underline">
            {t('common.login') || 'Войти'}
          </Link>
        </div>
      </div>
    );
  }

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>{t('common.loading') || 'Загрузка...'}</p>
        </div>
      </div>
    );
  }

  if (error || favoritesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            {t('favorites.error') || 'Ошибка'}
          </h1>
          <p className="text-[var(--muted)]">{error || favoritesError}</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h1 className="text-2xl font-bold mb-2">
            {t('favorites.empty') || 'Избранное пусто'}
          </h1>
          <p className="text-[var(--muted)] mb-6">
            {t('favorites.emptyDescription') || 'Добавьте книги в избранное, чтобы вернуться к ним позже'}
          </p>
          <Link 
            href="/" 
            className="inline-block bg-[var(--accent)] text-white px-6 py-3 rounded-md hover:bg-[var(--accent)]/80 transition-colors"
          >
            {t('favorites.browseBooks') || 'Просмотреть каталог'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('favorites.title') || 'Избранное'}
          </h1>
          <p className="text-[var(--muted)]">
            {t('favorites.count') || 'Количество'}: {favorites.length}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="card p-4 block hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 group"
            >
              <Link href={`/books/${book.id}`} className="block">
                <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-[var(--card)] relative group/image">
                  {book.imageUrl ? (
                    <img 
                      src={book.imageUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">{t('book.noImage') || 'Нет изображения'}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 z-10">
                    <FavoriteButton bookId={book.id} size="sm" />
                  </div>
                  {!book.isAvailable && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                      {t('book.unavailable') || 'Недоступно'}
                    </div>
                  )}
                </div>
                
                <h2 className="font-medium leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">{book.author}</p>
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
          ))}
        </div>
      </div>
    </div>
  );
}

