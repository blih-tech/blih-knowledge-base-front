'use client';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
const SESSION_KEY = 'admin-session-token';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function setAdminSession(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    if (typeof window !== 'undefined') {
      const token = btoa(Date.now().toString());
      const sessionData = {
        token,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
    return true;
  }
  return false;
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return false;

    const { timestamp } = JSON.parse(sessionData);
    const isExpired = Date.now() - timestamp > SESSION_DURATION;

    if (isExpired) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}
