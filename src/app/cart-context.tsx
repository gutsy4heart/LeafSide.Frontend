"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartItem = { bookId: string; quantity: number };
type CartState = { items: CartItem[] };

type CartContextType = {
  state: CartState;
  add: (bookId: string, quantity?: number) => void;
  remove: (bookId: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "leafside_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const add = (bookId: string, quantity: number = 1) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.bookId === bookId);
      if (existing) {
        return {
          items: prev.items.map((i) =>
            i.bookId === bookId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return { items: [...prev.items, { bookId, quantity }] };
    });
  };

  const remove = (bookId: string) => {
    setState((prev) => ({ items: prev.items.filter((i) => i.bookId !== bookId) }));
  };

  const clear = () => setState({ items: [] });

  const count = useMemo(() => state.items.reduce((n, i) => n + i.quantity, 0), [state.items]);

  const value: CartContextType = { state, add, remove, clear, count };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


