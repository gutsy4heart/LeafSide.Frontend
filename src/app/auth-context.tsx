"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserInfo = {
  email: string;
  name?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  gender?: string;
  roles?: string[];
  createdAt?: string;
};

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  isAdmin: boolean;
  isLoading: boolean;
  setToken: (t: string | null) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "leafside_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Функция для загрузки профиля пользователя с бэкенда
  const fetchUserProfile = async (token: string): Promise<UserInfo | null> => {
    try {
      console.log('Auth Context: Начинаем загрузку профиля с токеном:', token.substring(0, 20) + '...');
      setIsLoading(true);
      
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Auth Context: Получен ответ от API:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth Context: Ошибка при загрузке профиля:', response.status, errorText);
        return null;
      }

      const profile = await response.json();
      console.log('Auth Context: Успешно получен профиль:', profile);
      
      return {
        id: profile.id,
        email: profile.email,
        name: profile.firstName + ' ' + profile.lastName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        countryCode: profile.countryCode,
        gender: profile.gender,
        roles: profile.roles || [],
        createdAt: profile.createdAt
      };
    } catch (error) {
      console.error("Auth Context: Ошибка при загрузке профиля:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для декодирования токена и получения информации о пользователе
  const decodeToken = (token: string): UserInfo | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Auth Context: Decoded token payload:', payload);
      
      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const userId = payload.sub || payload.id;
      
      console.log('Auth Context: User ID from token:', userId);
      console.log('Auth Context: Roles from token:', roles);
      
      return {
        email: payload.email || payload.sub || "Пользователь",
        name: payload.name || payload.given_name || "Пользователь",
        id: userId || "Неизвестно",
        firstName: payload.firstName || payload.given_name,
        lastName: payload.lastName || payload.family_name,
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
        gender: payload.gender,
        roles: Array.isArray(roles) ? roles : (roles ? [roles] : []),
        createdAt: payload.createdAt
      };
    } catch (error) {
      console.error("Auth Context: Ошибка при декодировании токена:", error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const t = localStorage.getItem(STORAGE_KEY);
        if (t) {
          setTokenState(t);
          // Сначала загружаем профиль с бэкенда
          const userProfile = await fetchUserProfile(t);
          if (userProfile) {
            setUserInfo(userProfile);
          } else {
            // Если не удалось загрузить с бэкенда, используем данные из токена
            const user = decodeToken(t);
            setUserInfo(user);
          }
        }
      } catch (error) {
        console.error("Ошибка при инициализации токена:", error);
      }
    };

    initializeAuth();
  }, []);

  const setToken = async (t: string | null) => {
    setTokenState(t);
    if (t) {
      // Загружаем профиль с бэкенда
      const userProfile = await fetchUserProfile(t);
      if (userProfile) {
        setUserInfo(userProfile);
      } else {
        // Если не удалось загрузить с бэкенда, используем данные из токена
        const user = decodeToken(t);
        setUserInfo(user);
      }
      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch {}
    } else {
      setUserInfo(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  const logout = () => {
    setToken(null);
    setUserInfo(null);
  };

  const isAdmin = useMemo(() => {
    return userInfo?.roles?.includes("Admin") || false;
  }, [userInfo?.roles]);

  const value = useMemo<AuthContextType>(
    () => ({ 
      token, 
      isAuthenticated: Boolean(token), 
      userInfo,
      isAdmin,
      isLoading,
      setToken, 
      logout 
    }),
    [token, userInfo, isAdmin, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


