"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import { useCart } from "../cart-context";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalAmount: number;
  totalItems: number;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  totalAmount,
  totalItems
}: OrderConfirmationModalProps) {
  const { token, checkAndRefreshToken } = useAuth();
  const { state, clear } = useCart();
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Сброс состояния при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setError(null);
    }
  }, [isOpen]);

  const handleConfirmOrder = async () => {
    if (!token) {
      setError('Необходимо войти в систему');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStep('processing');

      // Проверяем и обновляем токен при необходимости
      const tokenValid = await checkAndRefreshToken();
      if (!tokenValid) {
        setError('Сессия истекла. Пожалуйста, войдите в систему заново.');
        setStep('confirm');
        return;
      }

      // Получаем актуальный токен
      const currentToken = token;

      // Подготавливаем данные заказа
      const orderData = {
        items: state.items.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity
        })),
        totalAmount: totalAmount
      };

      // Отправляем запрос на создание заказа
      console.log('Отправляем данные заказа:', orderData);
      console.log('Токен:', currentToken.substring(0, 20) + '...');
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      console.log('Ответ сервера:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Заказ успешно создан:', result);
        
        // Очищаем корзину
        clear();
        setStep('success');
        
        // Автоматически закрываем модальное окно через 3 секунды
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Ошибка при создании заказа:', errorData);
        setError(errorData.error || `Ошибка при оформлении заказа (${response.status})`);
        setStep('confirm');
      }
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      setError('Произошла ошибка при оформлении заказа');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-enter">
      <div className="bg-[var(--card)] border border-white/10 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            Подтверждение заказа
          </h3>
          {step === 'confirm' && (
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Содержимое в зависимости от шага */}
        {step === 'confirm' && (
          <div className="space-y-6">
            {/* Информация о заказе */}
            <div className="bg-[var(--background)] rounded-lg p-4">
              <h4 className="font-medium text-[var(--foreground)] mb-3">Детали заказа</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Товаров:</span>
                  <span className="text-[var(--foreground)]">{totalItems} шт.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Сумма:</span>
                  <span className="text-[var(--foreground)] font-medium">€{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Доставка:</span>
                  <span className="text-green-400">Бесплатно</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-medium">
                  <span className="text-[var(--foreground)]">Итого:</span>
                  <span className="text-[var(--accent)]">€{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--muted)] bg-[var(--card)] border border-white/20 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] bg-[var(--accent)] border border-transparent rounded-lg hover:bg-[var(--accent)]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Обработка...' : 'Подтвердить заказ'}
              </button>
            </div>
          </div>
        )}

        {/* Шаг обработки */}
        {step === 'processing' && (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-[var(--accent)]/20 rounded-full flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full"></div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-[var(--foreground)] mb-2">
                Обработка заказа
              </h4>
              <p className="text-[var(--muted)] text-sm">
                Пожалуйста, подождите. Мы обрабатываем ваш заказ...
              </p>
            </div>
          </div>
        )}

        {/* Шаг успешного оформления */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="relative success-animation">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {/* Анимация успеха */}
              <div className="absolute inset-0 w-16 h-16 mx-auto bg-green-500/30 rounded-full animate-ping"></div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-[var(--foreground)] mb-2">
                Заказ успешно оформлен!
              </h4>
              <p className="text-[var(--muted)] text-sm mb-4">
                Ваш заказ на сумму €{totalAmount.toFixed(2)} принят в обработку.
              </p>
              <p className="text-[var(--muted)] text-xs">
                Модальное окно закроется автоматически...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
