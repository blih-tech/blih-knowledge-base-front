"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi, type AuthUser } from "../api";
import { clearTokens, hasTokens, setTokens } from "./token.store";
import { ApiError } from "../api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  });

  const setUser = (user: AuthUser | null) => {
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isAdmin: user?.role === "admin",
    });
  };

  // On mount: restore session by calling /me with stored token
  const checkAuth = useCallback(async () => {
    if (!hasTokens()) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    try {
      const user = await authApi.getMe();
      setUser(user);
    } catch (err) {
      // Access token expired — try refresh
      if (err instanceof ApiError && err.status === 401) {
        try {
          const tokens = await authApi.refreshTokens();
          setTokens(tokens.accessToken, tokens.refreshToken);
          const user = await authApi.getMe();
          setUser(user);
        } catch {
          // Refresh failed — clear session
          clearTokens();
          setState({ user: null, isAuthenticated: false, isLoading: false, isAdmin: false });
        }
      } else {
        clearTokens();
        setState({ user: null, isAuthenticated: false, isLoading: false, isAdmin: false });
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setTokens(result.tokens.accessToken, result.tokens.refreshToken);
    setUser(result.user);
  };

  const logout = () => {
    clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false, isAdmin: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
}
