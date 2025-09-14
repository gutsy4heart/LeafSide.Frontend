"use client";

import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { isAuthenticated, userInfo, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated) {
    return null; // Редирект уже выполнен
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Профиль пользователя</h1>
        <p className="text-[var(--muted)]">Управление вашим аккаунтом</p>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Личная информация
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                  Email
                </label>
                <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-md text-[var(--foreground)]">
                  {userInfo?.email || "Загрузка..."}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                  Имя
                </label>
                <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-md text-[var(--foreground)]">
                  {userInfo?.name || "Не указано"}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                  ID пользователя
                </label>
                <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-md text-[var(--foreground)] font-mono text-sm">
                  {userInfo?.id || "Неизвестно"}
                </div>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Статистика
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[var(--card)] rounded-lg">
                <div className="text-2xl font-bold text-blue-500">0</div>
                <div className="text-sm text-[var(--muted)]">Заказов</div>
              </div>
              <div className="text-center p-4 bg-[var(--card)] rounded-lg">
                <div className="text-2xl font-bold text-green-500">0</div>
                <div className="text-sm text-[var(--muted)]">Куплено книг</div>
              </div>
              <div className="text-center p-4 bg-[var(--card)] rounded-lg">
                <div className="text-2xl font-bold text-purple-500">0</div>
                <div className="text-sm text-[var(--muted)]">В корзине</div>
              </div>
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Аватар */}
          <div className="card p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {userInfo?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <h3 className="font-semibold text-[var(--foreground)]">{userInfo?.name || "Пользователь"}</h3>
            <p className="text-sm text-[var(--muted)]">{userInfo?.email}</p>
          </div>

          {/* Действия */}
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Действия</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-md transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Настройки
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-md transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                История заказов
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
