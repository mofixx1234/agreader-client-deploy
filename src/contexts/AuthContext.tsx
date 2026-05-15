import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authService } from "../api/services/auth.service";

import type {
  AuthUser,
} from "../api/services/auth.service";

// =============================================
// TYPES
// =============================================

type AuthContextValue = {
  user: AuthUser | null;

  login: (
    email: string,
    password: string,
  ) => Promise<
    | { ok: true }
    | {
        ok: false;
        message: string;
      }
  >;

  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<
    | { ok: true }
    | {
        ok: false;
        message: string;
      }
  >;

  logout: () => void;
};


const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(() =>
    authService.getUser(),
  );


  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({
        email,
        password,
      });

      setUser(response.user);

      return {
        ok: true as const,
      };
    } catch (error: any) {
      return {
        ok: false as const,

        message: error?.response?.data?.error ?? "Login failed",
      };
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        const names = displayName.split(" ");

        const firstName = names[0] ?? "User";

        const lastName = names.slice(1).join(" ") || " ";

        const response = await authService.register({
          email,
          password,

          firstName,
          lastName,
        });

        setUser(response.user);

        return {
          ok: true as const,
        };
      } catch (error: any) {
        return {
          ok: false as const,

          message: error?.response?.data?.error ?? "Register failed",
        };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    authService.logout();

    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,

      login,

      register,

      logout,
    }),

    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================
// HOOK
// =============================================

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
