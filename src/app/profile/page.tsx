"use client";

import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { isAuthenticated, userInfo, logout, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

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

  const tabs = [
    { id: "profile", label: "Профиль", icon: "👤" },
    { id: "orders", label: "Заказы", icon: "📦" },
    { id: "favorites", label: "Избранное", icon: "❤️" },
    { id: "settings", label: "Настройки", icon: "⚙️" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-4">Загрузка профиля...</h1>
          <p className="text-gray-300">Получаем данные с сервера</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Редирект уже выполнен
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Мой профиль
          </h1>
          <p className="text-slate-300 text-lg">Добро пожаловать в ваш личный кабинет</p>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-4">
          {/* Боковая панель */}
          <div className="lg:col-span-1">
            {/* Аватар и основная информация */}
            <div className="card p-6 text-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {userInfo?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                {isAdmin && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👑</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-[var(--foreground)] text-lg">
                {userInfo?.firstName && userInfo?.lastName 
                  ? `${userInfo.firstName} ${userInfo.lastName}` 
                  : userInfo?.name || "Пользователь"}
              </h3>
              <p className="text-sm text-[var(--muted)] mb-2">{userInfo?.email}</p>
              <div className="flex items-center justify-center gap-2">
                {isAdmin && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    Администратор
                  </span>
                )}
                {!isAdmin && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    Пользователь
                  </span>
                )}
              </div>
            </div>

            {/* Навигация */}
            <div className="card p-4">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Навигация</h3>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="card p-4 mt-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Быстрые действия</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Корзина
                </button>
                
                <button className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Избранное
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => router.push('/admin')}
                    className="w-full text-left px-3 py-2 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Админ панель
                  </button>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Выйти
                </button>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Личная информация */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-3">
                      <span className="text-2xl">👤</span>
                      Личная информация
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {isEditing ? "Отменить" : "Редактировать"}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                        Имя
                      </label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          defaultValue={userInfo?.name || ""}
                          className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                          {userInfo?.name || "Не указано"}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                        Фамилия
                      </label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          defaultValue={userInfo?.lastName || ""}
                          className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                          {userInfo?.lastName || "Не указано"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                        Email
                      </label>
                      <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                        {userInfo?.email || "Загрузка..."}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                        Номер телефона
                      </label>
                      <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                        {userInfo?.phoneNumber ? `${userInfo.countryCode} ${userInfo.phoneNumber}` : "Не указано"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                        Пол
                      </label>
                      <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                        {userInfo?.gender === "Male" ? "Мужской" : 
                         userInfo?.gender === "Female" ? "Женский" : 
                         userInfo?.gender === "Other" ? "Другой" : "Не указано"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                        Дата регистрации
                      </label>
                      <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                        {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('ru-RU') : "Неизвестно"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Статистика */}
                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    Статистика
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                      <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
                      <div className="text-sm text-[var(--muted)]">Заказов</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30">
                      <div className="text-3xl font-bold text-green-400 mb-2">0</div>
                      <div className="text-sm text-[var(--muted)]">Куплено книг</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30">
                      <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
                      <div className="text-sm text-[var(--muted)]">В корзине</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30">
                      <div className="text-3xl font-bold text-orange-400 mb-2">0</div>
                      <div className="text-sm text-[var(--muted)]">Избранное</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  История заказов
                </h2>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Заказов пока нет</h3>
                  <p className="text-[var(--muted)] mb-6">Когда вы сделаете первый заказ, он появится здесь</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Перейти к покупкам
                  </button>
                </div>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                  <span className="text-2xl">❤️</span>
                  Избранное
                </h2>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Избранных книг нет</h3>
                  <p className="text-[var(--muted)] mb-6">Добавьте книги в избранное, чтобы они появились здесь</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Найти книги
                  </button>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  Настройки
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Уведомления</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 bg-[var(--card)] border-white/20 rounded focus:ring-blue-500" defaultChecked />
                        <span className="text-[var(--foreground)]">Email уведомления</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 bg-[var(--card)] border-white/20 rounded focus:ring-blue-500" />
                        <span className="text-[var(--foreground)]">SMS уведомления</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Безопасность</h3>
                    <div className="space-y-3">
                      <button className="w-full text-left px-4 py-3 bg-[var(--card)] border border-white/10 rounded-lg hover:bg-[var(--card)]/80 transition-colors">
                        <div className="font-medium text-[var(--foreground)]">Изменить пароль</div>
                        <div className="text-sm text-[var(--muted)]">Обновите пароль для безопасности</div>
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-[var(--card)] border border-white/10 rounded-lg hover:bg-[var(--card)]/80 transition-colors">
                        <div className="font-medium text-[var(--foreground)]">Двухфакторная аутентификация</div>
                        <div className="text-sm text-[var(--muted)]">Дополнительная защита аккаунта</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
