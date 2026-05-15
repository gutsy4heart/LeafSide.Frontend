"use client";

import { useAuth } from "../auth-context";
import { useTranslations } from "../../lib/translations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CountrySelect from "../components/CountrySelect";
import OrdersList from "../components/OrdersList";

export default function ProfilePage() {
  const { isAuthenticated, userInfo, logout, isAdmin, isLoading, token, refreshToken, checkAndRefreshToken } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalBooksPurchased: 0,
    itemsInCart: 0,
    favoritesCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+7',
    gender: 'Male'
  });
  const [updating, setUpdating] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Функция для загрузки данных профиля из базы данных
  const fetchUserProfile = async () => {
    if (!token) {
      console.log('Profile page - No token available for profile fetch');
      return;
    }
    
    if (isLoading) {
      console.log('Profile page - Still loading, skipping profile fetch');
      return;
    }
    
    // Проверяем и обновляем токен при необходимости
    const tokenValid = await checkAndRefreshToken();
    if (!tokenValid) {
      console.log('Profile page - Token invalid, skipping profile fetch');
      return;
    }
    
    // Получаем актуальный токен из контекста после возможного обновления
    const currentToken = getCurrentToken();
    
    if (!currentToken) {
      console.log('Profile page - No current token available for profile');
      return;
    }
    
    try {
      setProfileLoading(true);
      console.log('Profile page - Fetching profile with token:', currentToken.substring(0, 20) + '...');
      const response = await fetch('/api/account/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile page - Raw profile data:', data);
        console.log('Profile page - Data properties check:', {
          'data.firstName': data.firstName,
          'data.FirstName': data.FirstName,
          'data.lastName': data.lastName,
          'data.LastName': data.LastName,
          'data.phoneNumber': data.phoneNumber,
          'data.PhoneNumber': data.PhoneNumber,
          'data.countryCode': data.countryCode,
          'data.CountryCode': data.CountryCode,
          'data.gender': data.gender,
          'data.Gender': data.Gender,
          'userInfo?.firstName': userInfo?.firstName,
          'userInfo?.lastName': userInfo?.lastName,
          'userInfo?.phoneNumber': userInfo?.phoneNumber
        });
        
        const profileData = {
          firstName: data.firstName || data.FirstName || userInfo?.firstName || '',
          lastName: data.lastName || data.LastName || userInfo?.lastName || '',
          phoneNumber: data.phoneNumber || data.PhoneNumber || userInfo?.phoneNumber || '',
          countryCode: data.countryCode || data.CountryCode || userInfo?.countryCode || '+7',
          gender: data.gender || data.Gender || userInfo?.gender || 'Male'
        };
        
        console.log('Profile page - Final profile data:', profileData);
        setProfileData(profileData);
      } else if (response.status === 401) {
        console.error('Profile page - Unauthorized (401) when loading profile');
        // Если 401, пытаемся обновить токен
        console.log('Profile page - Attempting to refresh token for profile...');
        const refreshed = await refreshToken();
        if (refreshed) {
          console.log('Profile page - Token refreshed, retrying profile fetch...');
          // Получаем актуальный токен из контекста после обновления
          const updatedToken = getCurrentToken();
          if (updatedToken) {
            // Повторяем запрос с новым токеном
            const retryResponse = await fetch('/api/account/profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${updatedToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              console.log('Profile page - Profile data received after refresh:', retryData);
              setProfileData({
                firstName: retryData.firstName || retryData.FirstName || userInfo?.firstName || '',
                lastName: retryData.lastName || retryData.LastName || userInfo?.lastName || '',
                phoneNumber: retryData.phoneNumber || retryData.PhoneNumber || userInfo?.phoneNumber || '',
                countryCode: retryData.countryCode || retryData.CountryCode || userInfo?.countryCode || '+7',
                gender: retryData.gender || retryData.Gender || userInfo?.gender || 'Male'
              });
            } else {
              console.log('Profile page - Profile retry failed, using fallback data');
              setProfileData({
                firstName: userInfo?.firstName || '',
                lastName: userInfo?.lastName || '',
                phoneNumber: userInfo?.phoneNumber || '',
                countryCode: userInfo?.countryCode || '+7',
                gender: userInfo?.gender || 'Male'
              });
            }
          }
        } else {
          console.log('Profile page - Token refresh failed for profile, using fallback data');
          setProfileData({
            firstName: userInfo?.firstName || '',
            lastName: userInfo?.lastName || '',
            phoneNumber: userInfo?.phoneNumber || '',
            countryCode: userInfo?.countryCode || '+7',
            gender: userInfo?.gender || 'Male'
          });
        }
      } else {
        console.error('Ошибка при загрузке профиля:', response.status);
        // Используем данные из userInfo как fallback
        setProfileData({
          firstName: userInfo?.firstName || '',
          lastName: userInfo?.lastName || '',
          phoneNumber: userInfo?.phoneNumber || '',
          countryCode: userInfo?.countryCode || '+7',
          gender: userInfo?.gender || 'Male'
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      // Используем данные из userInfo как fallback
      setProfileData({
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
        phoneNumber: userInfo?.phoneNumber || '',
        countryCode: userInfo?.countryCode || '+7',
        gender: userInfo?.gender || 'Male'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Функция для загрузки статистики пользователя
  const fetchUserStats = async () => {
    if (!token) {
      console.log('Profile page - No token available for stats');
      return;
    }
    
    if (isLoading) {
      console.log('Profile page - Still loading, skipping stats fetch');
      return;
    }
    
    // Проверяем и обновляем токен при необходимости
    const tokenValid = await checkAndRefreshToken();
    if (!tokenValid) {
      console.log('Profile page - Token invalid, skipping stats fetch');
      return;
    }
    
    // Получаем актуальный токен из контекста после возможного обновления
    const currentToken = getCurrentToken();
    
    if (!currentToken) {
      console.log('Profile page - No current token available for stats');
      return;
    }
    
    try {
      setStatsLoading(true);
      console.log('Profile page - Fetching stats with token:', currentToken.substring(0, 20) + '...');
      
      const response = await fetch('/api/user/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Profile page - Stats response status:', response.status);
      console.log('Profile page - Stats response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile page - Stats data received:', data);
        setStats({
          totalOrders: data.totalOrders || 0,
          totalBooksPurchased: data.totalBooksPurchased || 0,
          itemsInCart: data.itemsInCart || 0,
          favoritesCount: data.favoritesCount || 0
        });
      } else if (response.status === 401) {
        console.error('Profile page - Unauthorized (401) - token may be expired or invalid');
        // Если 401, пытаемся обновить токен
        console.log('Profile page - Attempting to refresh token...');
        const refreshed = await refreshToken();
        if (refreshed) {
          console.log('Profile page - Token refreshed, retrying stats fetch...');
          // Получаем актуальный токен из контекста после обновления
          const updatedToken = getCurrentToken();
          if (updatedToken) {
            // Повторяем запрос с новым токеном
            const retryResponse = await fetch('/api/user/stats', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${updatedToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              console.log('Profile page - Stats data received after refresh:', retryData);
              setStats({
                totalOrders: retryData.totalOrders || 0,
                totalBooksPurchased: retryData.totalBooksPurchased || 0,
                itemsInCart: retryData.itemsInCart || 0,
                favoritesCount: retryData.favoritesCount || 0
              });
            } else {
              console.log('Profile page - Retry failed, keeping current stats');
            }
          }
        } else {
          console.log('Profile page - Token refresh failed, keeping current stats');
        }
      } else {
        console.error('Profile page - Error loading stats:', response.status);
        // Устанавливаем значения по умолчанию при других ошибках
        setStats({
          totalOrders: 0,
          totalBooksPurchased: 0,
          itemsInCart: 0,
          favoritesCount: 0
        });
      }
    } catch (error) {
        console.error('Profile page - Error loading stats:', error);
        // Устанавливаем значения по умолчанию при ошибке
        setStats({
          totalOrders: 0,
          totalBooksPurchased: 0,
          itemsInCart: 0,
          favoritesCount: 0
        });
      } finally {
        setStatsLoading(false);
      }
  };

  // Функция для принудительного обновления профиля
  const refreshProfile = async () => {
    console.log('Profile page - Manual refresh triggered');
    await fetchUserProfile();
  };

  // Функция для обновления профиля
  const updateProfile = async () => {
    if (!token) return;
    
    // Проверяем и обновляем токен при необходимости
    const tokenValid = await checkAndRefreshToken();
    if (!tokenValid) {
      console.log('Profile page - Token invalid for update');
      return;
    }
    
    // Используем токен из контекста
    if (!token) {
      console.log('Profile page - No token available for update');
      return;
    }
    
    try {
      setUpdating(true);
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: profileData.firstName,
          LastName: profileData.lastName,
          PhoneNumber: profileData.phoneNumber,
          CountryCode: profileData.countryCode,
          Gender: profileData.gender
        }),
      });
      
      console.log('Profile page - Response status:', response.status, response.statusText);
      console.log('Profile page - Response content-type:', response.headers.get('content-type'));

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const updatedProfile = await response.json();
          console.log('Profile page - Updated profile data:', updatedProfile);
          // Обновляем данные профиля из ответа сервера
          setProfileData({
            firstName: updatedProfile.firstName || updatedProfile.FirstName || '',
            lastName: updatedProfile.lastName || updatedProfile.LastName || '',
            phoneNumber: updatedProfile.phoneNumber || updatedProfile.PhoneNumber || '',
            countryCode: updatedProfile.countryCode || updatedProfile.CountryCode || '+7',
            gender: updatedProfile.gender || updatedProfile.Gender || 'Male'
          });
          setIsEditing(false);
          alert('Профиль успешно обновлен!');
        } else {
          // Если ответ не JSON, но статус OK, считаем успешным
          console.log('Profile page - Non-JSON response, but status OK');
          setIsEditing(false);
          alert('Профиль успешно обновлен!');
        }
        
        // Обновляем профиль после успешного сохранения
        console.log('Profile page - Refreshing profile after update');
        await fetchUserProfile();
        
        // Обновляем userInfo в контексте после успешного обновления
        if (userInfo) {
          const updatedUserInfo = {
            ...userInfo,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phoneNumber: profileData.phoneNumber,
            countryCode: profileData.countryCode,
            gender: profileData.gender,
            name: `${profileData.firstName} ${profileData.lastName}`.trim()
          };
          // Обновляем userInfo в контексте (это потребует доступа к setUserInfo из контекста)
          console.log('Profile page - Updated userInfo:', updatedUserInfo);
        }
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Profile page - Error data (JSON):', errorData);
          alert(`Ошибка: ${errorData.error || 'Не удалось обновить профиль'}`);
        } else {
          const text = await response.text();
          console.error('Profile page - Error data (not JSON):', text.substring(0, 200));
          alert(`Ошибка сервера: ${text.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      alert('Ошибка при обновлении профиля');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    console.log('Profile page - useEffect triggered:', { 
      isAuthenticated, 
      isLoading, 
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      userInfo: userInfo ? { email: userInfo.email, roles: userInfo.roles } : null
    });
    
    // Если загружается, ждем
    if (isLoading) {
      console.log('Profile page - Still loading auth data, waiting...');
      return;
    }

    // Если не авторизован, перенаправляем на логин только после завершения
    // инициализации AuthProvider. Иначе профиль может редиректнуть раньше,
    // чем токен будет прочитан из localStorage.
    if (!isAuthenticated) {
      console.log('Profile page - Not authenticated, redirecting to login');
      router.push("/login");
      return;
    }
    
    // Если нет токена, перенаправляем на логин
    if (!token) {
      console.log('Profile page - No token available, redirecting to login');
      router.push("/login");
      return;
    }
    
    // Добавляем небольшую задержку для стабильности
    const timer = setTimeout(() => {
      console.log('Profile page - Loading profile and stats with token:', token.substring(0, 20) + '...');
      fetchUserProfile();
      fetchUserStats();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, router, token, isLoading]);

  // Отдельный useEffect для отслеживания изменений токена и перезагрузки данных
  useEffect(() => {
    if (isAuthenticated && token && !isLoading) {
      console.log('Profile page - Token changed, reloading data');
      fetchUserProfile();
      fetchUserStats();
    }
  }, [token]);

  // Функция для получения актуального токена из контекста
  const getCurrentToken = () => {
    return token;
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const tabs = [
    { id: "profile", label: t('profile.title'), icon: "👤" },
    { id: "orders", label: t('profile.orders'), icon: "📦" },
    // { id: "favorites", label: t('profile.favorites'), icon: "❤️" },
    { id: "settings", label: t('profile.settings'), icon: "⚙️" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">{t('profile.loadingProfile')}</h1>
          <p className="text-[var(--muted)]">{t('profile.gettingData')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Редирект уже выполнен
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('profile.myProfile')}
          </h1>
          <p className="text-[var(--muted)] text-lg">{t('profile.welcomeMessage')}</p>
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
                {profileData.firstName && profileData.lastName 
                  ? `${profileData.firstName} ${profileData.lastName}` 
                  : userInfo?.name || t('profile.user')}
              </h3>
              <p className="text-sm text-[var(--muted)] mb-2">{userInfo?.email}</p>
              <div className="flex items-center justify-center gap-2">
                {isAdmin && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    {t('profile.administrator')}
                  </span>
                )}
                {!isAdmin && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {t('profile.user')}
                  </span>
                )}
              </div>
            </div>

            {/* Навигация */}
            <div className="card p-4">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">{t('profile.navigation')}</h3>
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
              <h3 className="font-semibold text-[var(--foreground)] mb-4">{t('profile.quickActions')}</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/cart')}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {t('profile.cart')}
                  {stats.itemsInCart > 0 && (
                    <span className="ml-auto px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      {stats.itemsInCart}
                    </span>
                  )}
                </button>
                
                {/* <button 
                  onClick={() => setActiveTab('favorites')}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg transition-colors flex items-center gap-2"
                 >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Избранное
                  {stats.favoritesCount > 0 && (
                    <span className="ml-auto px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                      {stats.favoritesCount}
                    </span>
                  )}
                </button> */}

                {isAdmin && (
                  <button 
                    onClick={() => router.push('/admin')}
                    className="w-full text-left px-3 py-2 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {t('profile.adminPanel')}
                  </button>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('profile.logout')}
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
                      {t('profile.personalInfo')}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={refreshProfile}
                        disabled={profileLoading}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className={`w-4 h-4 ${profileLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {profileLoading ? t('profile.loading') : t('profile.refresh')}
                      </button>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {isEditing ? t('profile.cancel') : t('profile.edit')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                            {t('profile.firstName')}
                          </label>
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                              className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                              {profileLoading ? t('profile.loading') : (profileData.firstName || t('profile.notSpecified'))}
                            </div>
                          )}
                        </div>
                    
                        <div>
                          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                            {t('profile.lastName')}
                          </label>
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                              className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                              {profileLoading ? t('profile.loading') : (profileData.lastName || t('profile.notSpecified'))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                            {t('profile.email')}
                          </label>
                          <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                            {profileLoading ? t('profile.loading') : (userInfo?.email || t('profile.notSpecified'))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                            {t('profile.phoneNumber')}
                          </label>
                          {isEditing ? (
                            <div className="flex gap-2">
                              <div className="w-40">
                                <CountrySelect
                                  value={profileData.countryCode}
                                  onChange={(code, phone) => {
                                    setProfileData(prev => ({ ...prev, countryCode: code }));
                                  }}
                                />
                              </div>
                              <input
                                type="tel"
                                value={profileData.phoneNumber}
                                onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                                className="flex-1 px-3 py-2 bg-[var(--card)] border border-white/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="1234567890"
                              />
                            </div>
                          ) : (
                            <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                              {profileLoading ? t('profile.loading') : (profileData.phoneNumber ? `${profileData.countryCode} ${profileData.phoneNumber}` : t('profile.notSpecified'))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                            {t('profile.gender')}
                          </label>
                          {isEditing ? (
                            <select
                              value={profileData.gender}
                              onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                              className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Male">{t('profile.male')}</option>
                              <option value="Female">{t('profile.female')}</option>
                              <option value="Other">{t('profile.other')}</option>
                            </select>
                          ) : (
                            <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                              {profileLoading ? t('profile.loading') : (profileData.gender === 'Male' ? t('profile.male') : 
                               profileData.gender === 'Female' ? t('profile.female') : 
                               profileData.gender === 'Other' ? t('profile.other') : t('profile.notSpecified'))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                            {t('profile.registrationDate')}
                          </label>
                          <div className="px-3 py-2 bg-[var(--card)] border border-white/10 rounded-lg text-[var(--foreground)]">
                            {profileLoading ? t('profile.loading') : (userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('ru-RU') : t('profile.notSpecified'))}
                          </div>
                        </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-white/10">
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={updating}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                      >
                        {t('profile.cancel')}
                      </button>
                      <button
                        onClick={updateProfile}
                        disabled={updating}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {updating && (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        )}
                        {updating ? t('profile.saving') : t('profile.saveChanges')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Статистика */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      {t('profile.statistics')}
                    </h2>
                    <button
                      onClick={fetchUserStats}
                      disabled={statsLoading}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {statsLoading ? t('profile.refreshing') : t('profile.refresh')}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {statsLoading ? (
                          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
                        ) : (
                          stats.totalOrders
                        )}
                      </div>
                      <div className="text-sm text-[var(--muted)]">{t('profile.ordersCount')}</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {statsLoading ? (
                          <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto"></div>
                        ) : (
                          stats.totalBooksPurchased
                        )}
                      </div>
                      <div className="text-sm text-[var(--muted)]">{t('profile.booksPurchased')}</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30">
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {statsLoading ? (
                          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                        ) : (
                          stats.itemsInCart
                        )}
                      </div>
                      <div className="text-sm text-[var(--muted)]">{t('profile.inCart')}</div>
                    </div>
                    {/* <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30">
                      <div className="text-3xl font-bold text-orange-400 mb-2">
                        {statsLoading ? (
                          <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full mx-auto"></div>
                        ) : (
                          stats.favoritesCount
                        )}
                      </div>
                      <div className="text-sm text-[var(--muted)]">Избранное</div>
                    </div> */}
                  </div>
                  
                  {!statsLoading && stats.totalOrders === 0 && stats.totalBooksPurchased === 0 && stats.itemsInCart === 0 && stats.favoritesCount === 0 && (
                    <div className="text-center py-4">
                      <p className="text-[var(--muted)] text-sm">
                        {t('profile.statsUnavailable')}
                      </p>
                      <button
                        onClick={fetchUserStats}
                        className="mt-2 px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        {t('profile.tryAgain')}
                      </button>
                    </div>
                  )}
                  
                  {/* Quick Profile Data Fix */}
                  {(!profileData.firstName || !profileData.lastName || !profileData.phoneNumber) && (
                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-yellow-500 mb-1">
                            Отсутствуют данные профиля
                          </h3>
                          <p className="text-sm text-yellow-400 mb-3">
                            Некоторые данные профиля отсутствуют. Это может быть связано с тем, что бэкенд не сохраняет данные при регистрации. Вы можете заполнить их вручную.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const firstName = prompt("Введите ваше имя:");
                                const lastName = prompt("Введите вашу фамилию:");
                                const phoneNumber = prompt("Введите ваш номер телефона:");
                                if (firstName && lastName && phoneNumber) {
                                  setProfileData(prev => ({
                                    ...prev,
                                    firstName,
                                    lastName,
                                    phoneNumber: phoneNumber.replace(/\D/g, ''),
                                    countryCode: prev.countryCode || '+7'
                                  }));
                                  // Try to save to backend
                                  updateProfile();
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-md hover:bg-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-colors"
                            >
                              Быстрое исправление
                            </button>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="px-3 py-1.5 text-xs font-medium text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-md hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                            >
                              Редактировать профиль
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="card p-6">
                <OrdersList />
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                  <span className="text-2xl">❤️</span>
                  {t('profile.favorites')}
                </h2>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{t('profile.noFavorites')}</h3>
                  <p className="text-[var(--muted)] mb-6">{t('profile.addFavorites')}</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {t('profile.findBooks')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  {t('profile.settings')}
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t('profile.notifications')}</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input disabled type="checkbox" className="w-4 h-4 text-blue-600 bg-[var(--card)] border-white/20 rounded focus:ring-blue-500" />
                        <span className="text-[var(--foreground)]">{t('profile.emailNotifications')}</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input disabled type="checkbox" className="w-4 h-4 text-blue-600 bg-[var(--card)] border-white/20 rounded focus:ring-blue-500" />
                        <span className="text-[var(--foreground)]">{t('profile.smsNotifications')}</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t('profile.security')}</h3>
                    <div className="space-y-3">
                      <button className="w-full text-left px-4 py-3 bg-[var(--card)] border border-white/10 rounded-lg hover:bg-[var(--card)]/80 transition-colors" disabled>
                        <div className="font-medium text-[var(--foreground)]">{t('profile.changePassword')}</div>
                        <div className="text-sm text-[var(--muted)]">{t('profile.passwordDescription')}</div>
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-[var(--card)] border border-white/10 rounded-lg hover:bg-[var(--card)]/80 transition-colors" disabled>
                        <div className="font-medium text-[var(--foreground)]">{t('profile.twoFactorAuth')}</div>
                        <div className="text-sm text-[var(--muted)]">{t('profile.twoFactorDescription')}</div>
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
