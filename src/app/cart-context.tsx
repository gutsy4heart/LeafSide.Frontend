"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";

type CartItem = { 
  bookId: string; 
  quantity: number; 
  priceSnapshot?: number;
};

type CartState = { 
  items: CartItem[];
  id?: string;
};

type CartContextType = {
  state: CartState;
  add: (bookId: string, quantity?: number) => Promise<void>;
  remove: (bookId: string) => Promise<void>;
  clear: () => Promise<void>;
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [state, setState] = useState<CartState>({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем корзину с сервера
  const loadCart = async () => {
    if (!token || !isAuthenticated) {
      setState({ items: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState({
          id: data.Id,
          items: data.Items?.map((item: any) => ({
            bookId: item.BookId,
            quantity: item.Quantity,
            priceSnapshot: item.PriceSnapshot
          })) || []
        });
      } else if (response.status === 401) {
        // Пользователь не авторизован
        setState({ items: [] });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка загрузки корзины');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Cart load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем корзину при изменении токена
  useEffect(() => {
    loadCart();
  }, [token, isAuthenticated]);

  const add = async (bookId: string, quantity: number = 1) => {
    if (!token || !isAuthenticated) {
      setError('Необходимо войти в систему');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BookId: bookId,
          Quantity: quantity
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setState({
          id: data.Id,
          items: data.Items?.map((item: any) => ({
            bookId: item.BookId,
            quantity: item.Quantity,
            priceSnapshot: item.PriceSnapshot
          })) || []
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка добавления в корзину');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Cart add error:', err);
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

      const response = await fetch(`/api/cart/items/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setState(prev => ({
          ...prev,
          items: prev.items.filter(item => item.bookId !== bookId)
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка удаления из корзины');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Cart remove error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    if (!token || !isAuthenticated) {
      setError('Необходимо войти в систему');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setState({ items: [] });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка очистки корзины');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Cart clear error:', err);
    } finally {
      setLoading(false);
    }
  };

  const count = useMemo(() => state.items.reduce((n, i) => n + i.quantity, 0), [state.items]);

  const value: CartContextType = { 
    state, 
    add, 
    remove, 
    clear, 
    count, 
    loading, 
    error,
    refresh: loadCart
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


