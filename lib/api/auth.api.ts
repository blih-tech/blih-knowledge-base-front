import { serverFetch } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const authApi = {
  getMe: () => serverFetch<AuthUser>("/auth/me"),
};
