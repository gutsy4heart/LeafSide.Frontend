"use client";
import { useCart } from "./cart-context";

export default function CartNav() {
  const { count } = useCart();
  return (
    <nav className="text-sm text-[var(--muted)] flex items-center gap-5">
      <a href="/" className="hover:text-[var(--foreground)]">Каталог</a>
      <a href="#" className="hover:text-[var(--foreground)]">О нас</a>
      <a href="#" className="hover:text-[var(--foreground)]">Контакты</a>
      <a href="#" className="btn-accent">Корзина ({count})</a>
    </nav>
  );
}


