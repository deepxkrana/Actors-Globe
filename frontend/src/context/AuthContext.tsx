import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; name: string; role: "ACTOR" | "CASTER" }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isActor: boolean;
  isCaster: boolean;
  isAdmin: boolean;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [adminToken, setAdminTokenState] = useState<string | null>(api.getAdminToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!api.getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        api.logout();
        setUser(null);
        setToken(null);
      }
    } catch {
      api.logout();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  };

  const register = async (data: { email: string; password: string; name: string; role: "ACTOR" | "CASTER" }) => {
    const res = await api.register(data);
    if (res.success && res.data) {
      setUser(res.data.user);
      if (res.data.token) {
        setToken(res.data.token);
      }
      return { success: true };
    }
    return { success: false, error: res.error || "Registration failed" };
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
  };

  const setAdminToken = (t: string | null) => {
    api.setAdminToken(t);
    setAdminTokenState(t);
  };

  const isActor = user?.role === "ACTOR";
  const isCaster = user?.role === "CASTER";
  const isAdmin = user?.role === "ADMIN" || !!adminToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isActor,
        isCaster,
        isAdmin,
        adminToken,
        setAdminToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
