"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  logout as apiLogout,
} from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isCheckingAuth: boolean; // ✅ NEW
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // ✅ NEW
  const router = useRouter();

  // ✅ Load saved user on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setIsCheckingAuth(false); // ✅ Done checking
  }, []);

  // 🔐 Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiLogin(email, password);
      const mappedUser = {
        id: data.user.id,
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        email: data.user.email,
        role: data.user.role.toLowerCase(),
      };

      setToken(data.accessToken);
      setUser(mappedUser);
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(mappedUser));

      router.push("/dashbord");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const logout = () => {
    void apiLogout();
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, error, isCheckingAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
