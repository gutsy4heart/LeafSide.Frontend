"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserInfo = {
  email: string;
  name?: string;
  id?: string;
};

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "leafside_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Функция для декодирования токена и получения информации о пользователе
  const decodeToken = (token: string): UserInfo | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.email || payload.sub || "Пользователь",
        name: payload.name || payload.given_name || "Пользователь",
        id: payload.sub || payload.id || "Неизвестно"
      };
    } catch (error) {
      console.error("Ошибка при декодировании токена:", error);
      return null;
    }
  };

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEY);
      if (t) {
        setTokenState(t);
        const user = decodeToken(t);
        setUserInfo(user);
      }
    } catch {}
  }, []);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) {
      const user = decodeToken(t);
      setUserInfo(user);
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

  const value = useMemo<AuthContextType>(
    () => ({ 
      token, 
      isAuthenticated: Boolean(token), 
      userInfo,
      setToken, 
      logout 
    }),
    [token, userInfo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


