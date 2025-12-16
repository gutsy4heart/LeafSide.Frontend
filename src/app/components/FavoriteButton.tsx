"use client";

import { useFavorites } from "../favorites-context";
import { useAuth } from "../auth-context";
import { useState } from "react";

interface FavoriteButtonProps {
  bookId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FavoriteButton({ bookId, className = "", size = "md" }: FavoriteButtonProps) {
  const { isFavorite, add, remove, loading } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [isToggling, setIsToggling] = useState(false);

  const favorite = isFavorite(bookId);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Можно показать уведомление о необходимости входа
      return;
    }

    setIsToggling(true);
    try {
      if (favorite) {
        await remove(bookId);
      } else {
        await add(bookId);
      }
    } catch (error) {
      console.error('FavoriteButton - Error toggling favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Не показываем кнопку, если пользователь не авторизован
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading || isToggling}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className} ${
        favorite
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-red-500"
      }`}
      title={favorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      {isToggling ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : favorite ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}

