"use client";

import { Book } from "../../types/book";
import { useCart } from "../cart-context";
import { useState } from "react";
import Link from "next/link";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { add } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    add(book.id, 1);
    
    // Небольшая задержка для визуального эффекта
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className="card p-4 block hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 group">
      <Link href={`/books/${book.id}`} className="block">
        <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-[var(--card)] relative">
          {book.imageUrl ? (
            <img 
              src={book.imageUrl} 
              alt={book.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Нет изображения</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
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
        <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Нажмите для подробностей →
        </div>
      </Link>
      
      {/* Кнопка добавления в корзину */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-[var(--accent)] text-white py-2 px-3 rounded-md hover:bg-[var(--accent)]/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAdding ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Добавляем...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 16a2 2 0 104 0 2 2 0 00-4 0m8 0a2 2 0 104 0 2 2 0 00-4 0" />
              </svg>
              В корзину
            </>
          )}
        </button>
      </div>
    </div>
  );
}
