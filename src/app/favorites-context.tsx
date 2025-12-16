"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import { Book } from "../types/book";

type Favorite = {
  id: string;
  bookId: string;
  createdAt: string;
  book?: Book;
};

type FavoritesContextType = {
  favorites: Favorite[];
  add: (bookId: string) => Promise<void>;
  remove: (bookId: string) => Promise<void>;
  isFavorite: (bookId: string) => boolean;
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем избранное с сервера
  const loadFavorites = async () => {
    if (!token || !isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data || []);
      } else if (response.status === 401) {
        setFavorites([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка загрузки избранного');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Favorites load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем избранное при изменении токена
  useEffect(() => {
    loadFavorites();
  }, [token, isAuthenticated]);

  const add = async (bookId: string) => {
    if (!token || !isAuthenticated) {
      setError('Необходимо войти в систему');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BookId: bookId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Добавляем новое избранное в список
        setFavorites(prev => [...prev, {
          id: data.id,
          bookId: data.bookId,
          createdAt: data.createdAt
        }]);
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          // Книга уже в избранном, просто обновляем список
          await loadFavorites();
        } else {
          setError(errorData.error || 'Ошибка добавления в избранное');
        }
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Favorites add error:', err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (bookId: string) => {
    if (!token || !isAuthenticated) {
      setError('Необходимо войти в систему');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/favorites/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Удаляем из локального состояния
        setFavorites(prev => prev.filter(fav => fav.bookId !== bookId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка удаления из избранного');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Favorites remove error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (bookId: string): boolean => {
    return favorites.some(fav => fav.bookId === bookId);
  };

  const count = useMemo(() => {
    return favorites.length;
  }, [favorites]);

  const value: FavoritesContextType = { 
    favorites, 
    add, 
    remove, 
    isFavorite,
    count, 
    loading, 
    error,
    refresh: loadFavorites
  };
  
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

