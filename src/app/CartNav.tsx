"use client";
import { useCart } from "./cart-context";
import { useAuth } from "./auth-context";

export default function CartNav() {
  const { count } = useCart();
  const { isAuthenticated, logout } = useAuth();
  return (
    <nav className="text-sm text-[var(--muted)] flex items-center gap-5">
      <a href="/" className="hover:text-[var(--foreground)]">Каталог</a>
      <a href="#" className="hover:text-[var(--foreground)]">О нас</a>
      <a href="#" className="hover:text-[var(--foreground)]">Контакты</a>
      <a href="#" className="btn-accent">Корзина ({count})</a>
      {isAuthenticated ? (
        <button onClick={logout} className="text-sm hover:text-[var(--foreground)]">Выйти</button>
      ) : (
        <a href="/login" className="text-sm hover:text-[var(--foreground)]">Войти</a>
      )}
    </nav>
  );
}


