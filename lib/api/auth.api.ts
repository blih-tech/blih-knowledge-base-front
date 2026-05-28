import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const authApi = {
  getMe: () => apiClient.get<AuthUser>("/auth/me"),
};
