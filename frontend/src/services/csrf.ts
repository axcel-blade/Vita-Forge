const CSRF_COOKIE_NAME = 'vf_csrf';

/** Reads the (non-HttpOnly) CSRF cookie the backend sets alongside the session cookie. */
export function getCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
