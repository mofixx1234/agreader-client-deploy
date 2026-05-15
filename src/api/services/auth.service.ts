// api/services/auth.service.ts

import { httpClient } from "../http";
import { Endpoints } from "../endpoint";
import { tokenStorage } from "../http";
// =============================================
// STORAGE KEYS
// =============================================

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;

const USER_KEY = import.meta.env.VITE_USER_KEY;

// =============================================
// TYPES
// =============================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// =============================================
// SERVICE
// =============================================

export const authService = {
  // =============================================
  // LOGIN
  // =============================================

  async login(payload: LoginDto) {
    const response = await httpClient.post<AuthResponse>(
      Endpoints.auth.login,
      payload,
      {
        skipAuth: true,
      },
    );

    tokenStorage.setTokens(response.accessToken, response.refreshToken);

    this.saveSession(response);

    localStorage.setItem(
      import.meta.env.VITE_USER_KEY,
      JSON.stringify(response.user),
    );

    return response;
  },

  // =============================================
  // REGISTER
  // =============================================

  async register(payload: RegisterDto) {
    const response = await httpClient.post<AuthResponse>(
      Endpoints.auth.register,
      payload,
      {
        skipAuth: true,
      },
    );

    tokenStorage.setTokens(response.accessToken, response.refreshToken);

    this.saveSession(response);

    localStorage.setItem(
      import.meta.env.VITE_USER_KEY,
      JSON.stringify(response.user),
    );

    return response;
  },

  // =============================================
  // SAVE SESSION
  // =============================================

  saveSession(response: AuthResponse) {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);

    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  },

  // =============================================
  // GET TOKEN
  // =============================================

  getAccessToken() {
    return tokenStorage.getAccessToken();
  },

  // =============================================
  // GET USER
  // =============================================

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(import.meta.env.VITE_USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // =============================================
  // CURRENT USER
  // =============================================

  async me() {
    return httpClient.get<AuthUser>(Endpoints.auth.me);
  },

  // =============================================
  // LOGOUT
  // =============================================

  async logout() {
    await httpClient.post(Endpoints.auth.logout);

    tokenStorage.clearTokens();

    localStorage.removeItem(import.meta.env.VITE_USER_KEY);
  },
};
