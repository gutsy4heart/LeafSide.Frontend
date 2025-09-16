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
    console.log('Cart Context - loadCart called, token exists:', !!token, 'isAuthenticated:', isAuthenticated);
    
    if (!token || !isAuthenticated) {
      console.log('Cart Context - No token or not authenticated, clearing cart');
      setState({ items: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Cart Context - Loading cart from server...');
      const response = await fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Cart Context - Load response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Cart Context - Load response data:', data);
        console.log('Cart Context - data.items type:', typeof data.items);
        console.log('Cart Context - data.items is array:', Array.isArray(data.items));
        console.log('Cart Context - data.items length:', data.items?.length);
        console.log('Cart Context - data.items content:', data.items);
        
        const newState = {
          id: data.id,
          items: data.items?.map((item: any) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot
          })) || []
        };
        
        console.log('Cart Context - Load new state:', newState);
        console.log('Cart Context - Mapped items:', newState.items);
        setState(newState);
      } else if (response.status === 401) {
        // Пользователь не авторизован
        console.log('Cart Context - 401 response, clearing cart');
        setState({ items: [] });
      } else {
        const errorData = await response.json();
        console.error('Cart Context - Load error:', errorData);
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

      // Проверяем, что bookId является валидным GUID
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!guidRegex.test(bookId)) {
        setError('Неверный формат ID книги');
        return;
      }

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
        
        const newState = {
          id: data.id,
          items: data.items?.map((item: any) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot
          })) || []
        };
        
        setState(newState);
      } else {
        console.error('Cart Context - Response not OK:', response.status, response.statusText);
        
        let errorMessage = 'Ошибка добавления в корзину';
        try {
          const errorData = await response.json();
          console.error('Cart Context - Error data:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Cart Context - Failed to parse error JSON:', jsonError);
          // Если не удается распарсить JSON, используем текст ответа
          try {
            const errorText = await response.text();
            console.error('Cart Context - Error text:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Cart Context - Failed to get error text:', textError);
          }
        }
        
        setError(errorMessage);
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

  const count = useMemo(() => {
    const total = state.items.reduce((n, i) => n + i.quantity, 0);
    console.log('Cart Context - Count calculated:', total, 'from items:', state.items);
    return total;
  }, [state.items]);

  // Логируем изменения состояния корзины
  useEffect(() => {
    console.log('Cart Context - State changed:', state);
    console.log('Cart Context - Items in state:', state.items);
    console.log('Cart Context - Count in state:', count);
  }, [state, count]);

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


