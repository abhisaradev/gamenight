"use client";

// Client-side helpers for the admin panel.
// The Supabase anon client is reused for writes (RLS allows public access);
// the ADMIN_PASSWORD gate lives at the UI layer via this token.

export const ADMIN_TOKEN_KEY = "gn_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}
