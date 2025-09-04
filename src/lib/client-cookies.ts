'use client';

export async function setClientCookie(
  key: string,
  value: string,
  options?: { path?: string; maxAge?: number }
) {
  const path = options?.path ?? '/';
  const maxAge = options?.maxAge ?? 60 * 60 * 24 * 7;

  // Use Cookie Store API if available, fallback to document.cookie
  if ('cookieStore' in window) {
    await window.cookieStore.set({
      name: key,
      value,
      path,
      expires: Date.now() + maxAge * 1000,
    });
  } else {
    // Fallback for browsers that don't support Cookie Store API
    // biome-ignore lint/suspicious/noDocumentCookie: Fallback for older browsers
    document.cookie = `${key}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}`;
  }
}
