"use client";

export async function setClientCookie(key: string, value: string, options?: { path?: string; maxAge?: number }) {
  const path = options?.path ?? "/";
  const maxAge = options?.maxAge ?? 60 * 60 * 24 * 7;
  document.cookie = `${key}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}`;
}


