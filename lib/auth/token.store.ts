const ACCESS_TOKEN_KEY = "blih_access_token";
const REFRESH_TOKEN_KEY = "blih_refresh_token";

const isClient = typeof window !== "undefined";

export function setTokens(accessToken: string, refreshToken: string): void {
  if (!isClient) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (!isClient) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isClient) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  if (!isClient) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasTokens(): boolean {
  return !!getAccessToken() && !!getRefreshToken();
}
