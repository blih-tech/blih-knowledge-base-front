import { apiAxios, ApiError } from "./axios";

export { ApiError };

export const apiClient = {
  get: <T>(endpoint: string) =>
    apiAxios.get<T>(endpoint).then((r) => r.data),

  post: <T>(endpoint: string, body: unknown) =>
    apiAxios.post<T>(endpoint, body).then((r) => r.data),

  put: <T>(endpoint: string, body: unknown) =>
    apiAxios.put<T>(endpoint, body).then((r) => r.data),

  patch: <T>(endpoint: string, body: unknown) =>
    apiAxios.patch<T>(endpoint, body).then((r) => r.data),

  delete: <T>(endpoint: string) =>
    apiAxios.delete<T>(endpoint).then((r) => r.data),
};
