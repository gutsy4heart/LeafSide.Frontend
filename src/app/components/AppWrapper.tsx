"use client";

import { CartProvider } from "../cart-context";
import { FavoritesProvider } from "../favorites-context";
import { AuthProvider } from "../auth-context";
import { LanguageProvider } from "../language-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

