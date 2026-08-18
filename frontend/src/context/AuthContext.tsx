import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);

  const autoLoginAdmin = async () => {
    try {
      const data = await api.login("admin", "admin123");
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } catch (err) {
      console.error("Auto login failed:", err);
      // Fallback mock user if backend is offline
      setUser({
        id: 1,
        username: "admin",
        full_name: "System Administrator",
        role: "admin",
      });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch {
          await autoLoginAdmin();
        }
      } else {
        await autoLoginAdmin();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password);
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    autoLoginAdmin();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
