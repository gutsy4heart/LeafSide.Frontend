"use client";
import { useCart } from "./cart-context";
import { useAuth } from "./auth-context";
import UserDropdown from "./components/UserDropdown";

export default function CartNav() {
  const { count } = useCart();
  const { isAuthenticated } = useAuth();
  
  return (
    <nav className="text-sm text-[var(--muted)] flex items-center gap-5">
      <a href="/" className="hover:text-[var(--foreground)] transition-colors">Каталог</a>
      <a href="#" className="hover:text-[var(--foreground)] transition-colors">О нас</a>
      <a href="#" className="hover:text-[var(--foreground)] transition-colors">Контакты</a>
      <a href="#" className="btn-accent flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 16a2 2 0 104 0 2 2 0 00-4 0m8 0a2 2 0 104 0 2 2 0 00-4 0" />
        </svg>
        Корзина ({count})
      </a>
      {isAuthenticated ? (
        <UserDropdown />
      ) : (
        <a href="/login" className="text-sm hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Войти
        </a>
      )}
    </nav>
  );
}


