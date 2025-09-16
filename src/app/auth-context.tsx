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
  exp?: number;
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

  const clearAuth = () => {
    setTokenState(null);
    setUserInfo(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // Функция для загрузки профиля пользователя с бэкенда
  const fetchUserProfile = async (token: string): Promise<UserInfo | null> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/account/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        clearAuth();
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const profile = await response.json();
      console.log('fetchUserProfile - Raw profile data:', profile);
      
      return {
        id: profile.id || profile.Id,
        email: profile.email || profile.Email,
        name: (profile.firstName || profile.FirstName || '') + ' ' + (profile.lastName || profile.LastName || ''),
        firstName: profile.firstName || profile.FirstName,
        lastName: profile.lastName || profile.LastName,
        phoneNumber: profile.phoneNumber || profile.PhoneNumber,
        countryCode: profile.countryCode || profile.CountryCode,
        gender: profile.gender || profile.Gender,
        roles: profile.roles || profile.Roles || [],
        createdAt: profile.createdAt || profile.CreatedAt
      };
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка истечения срока действия токена (exp)
  const isTokenExpired = (t: string): boolean => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      if (!payload?.exp) return false;
      const nowSeconds = Math.floor(Date.now() / 1000);
      return payload.exp <= nowSeconds;
    } catch {
      return false;
    }
  };

  // Функция для декодирования токена и получения информации о пользователе
  const decodeToken = (token: string): UserInfo | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const userId = payload.sub || payload.id;
      
      // Обрабатываем роли правильно
      let userRoles: string[] = [];
      if (roles) {
        if (Array.isArray(roles)) {
          userRoles = roles;
        } else if (typeof roles === 'string') {
          userRoles = [roles];
        }
      }
      
      console.log('DecodeToken - Raw roles from JWT:', roles);
      console.log('DecodeToken - Processed roles:', userRoles);
      
      return {
        email: payload.email || payload.sub || "Пользователь",
        name: payload.name || payload.given_name || "Пользователь",
        id: userId || "Неизвестно",
        firstName: payload.firstName || payload.given_name,
        lastName: payload.lastName || payload.family_name,
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
        gender: payload.gender,
        roles: userRoles,
        createdAt: payload.createdAt,
        exp: payload.exp,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const t = localStorage.getItem(STORAGE_KEY);
        if (t) {
          if (isTokenExpired(t)) { clearAuth(); return; }
          setTokenState(t);
          
          // Сначала декодируем токен для получения ролей
          const user = decodeToken(t);
          if (user) {
            setUserInfo(user);
          }
          
          // Затем пытаемся получить полный профиль с сервера
          try {
            const userProfile = await fetchUserProfile(t);
            if (userProfile) {
              setUserInfo(userProfile);
            }
          } catch (error) {
            console.log('Failed to fetch user profile, using token data:', error);
          }
        }
      } catch {}
    };

    initializeAuth();
  }, []);

  const setToken = async (t: string | null) => {
    setTokenState(t);
    if (t) {
      if (isTokenExpired(t)) { clearAuth(); return; }
      
      // Сначала декодируем токен для получения ролей
      const user = decodeToken(t);
      if (user) {
        setUserInfo(user);
      }
      
      // Затем пытаемся получить полный профиль с сервера
      try {
        const userProfile = await fetchUserProfile(t);
        if (userProfile) {
          setUserInfo(userProfile);
        }
      } catch (error) {
        console.log('Failed to fetch user profile, using token data:', error);
      }
      
      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch {}
    } else {
      clearAuth();
    }
  };

  const logout = () => {
    clearAuth();
  };

  const isAdmin = useMemo(() => {
    const hasAdminRole = userInfo?.roles?.includes("Admin") || false;
    console.log('Auth Context - User roles:', userInfo?.roles);
    console.log('Auth Context - Is admin:', hasAdminRole);
    return hasAdminRole;
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


