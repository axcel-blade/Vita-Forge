/** Name of the HttpOnly cookie holding the opaque session identifier. */
export const SESSION_COOKIE_NAME = 'vf_session';

/** Name of the readable (non-HttpOnly) cookie used for double-submit CSRF checks. */
export const CSRF_COOKIE_NAME = 'vf_csrf';

/** Request header the frontend echoes the CSRF cookie value back through. */
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Sliding inactivity window: a session's expiresAt is pushed forward by this amount on every
 * authenticated request, and the cookie itself is minted with the same max age.
 */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
