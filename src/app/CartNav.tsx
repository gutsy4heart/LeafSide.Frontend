"use client";
import { useCart } from "./cart-context";
import { useFavorites } from "./favorites-context";
import { useAuth } from "./auth-context";
import { useTranslations } from "../lib/translations";
import UserDropdown from "./components/UserDropdown";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default function CartNav() {
  const { count } = useCart();
  const { count: favoritesCount } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslations();
  
  return (
    <nav className="text-sm text-[var(--muted)] flex items-center gap-5">
      <a href="/" className="hover:text-[var(--foreground)] transition-colors">{t('navigation.catalog')}</a>
      <a href="/about" className="hover:text-[var(--foreground)] transition-colors">{t('navigation.about')}</a>
      <a href="/contact" className="hover:text-[var(--foreground)] transition-colors">{t('navigation.contacts')}</a>
      {isAuthenticated && (
        <a href="/favorites" className="flex items-center gap-2 relative hover:text-[var(--foreground)] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {t('navigation.favorites') || 'Избранное'}
          {favoritesCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {favoritesCount}
            </span>
          )}
        </a>
      )}
      <a href="/cart" className="btn-accent flex items-center gap-2 relative">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 16a2 2 0 104 0 2 2 0 00-4 0m8 0a2 2 0 104 0 2 2 0 00-4 0" />
        </svg>
        {t('navigation.cart')}
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {count}
          </span>
        )}
      </a>
      <LanguageSwitcher />
      {isAuthenticated ? (
        <UserDropdown />
      ) : (
        <a href="/login" className="text-sm hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          {t('navigation.login')}
        </a>
      )}
    </nav>
  );
}


