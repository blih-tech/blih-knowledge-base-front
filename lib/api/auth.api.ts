import { apiClient } from "./client";
import { getAccessToken, getRefreshToken } from "../auth/token.store";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RegisterResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResult>("/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<RegisterResult>("/auth/register", { name, email, password }),

  getMe: () => apiClient.get<AuthUser>("/auth/me", getAccessToken()),

  refreshTokens: () =>
    apiClient.post<AuthTokens>("/auth/refresh-token", {
      refreshToken: getRefreshToken(),
    }),
};
