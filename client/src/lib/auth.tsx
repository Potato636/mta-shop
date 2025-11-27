import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (e) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (parseError) {
            localStorage.removeItem("user");
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (e) {
      // Ignore logout errors
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  const isAdmin = user?.isAdmin === 1;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
