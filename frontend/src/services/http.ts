import { API_BASE_URL, API_CONFIG } from './config';
import { ApiError } from './error-handling';
import { getCsrfToken } from './csrf';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', undefined]);

/**
 * Registered by AuthProvider so a 401 from any authenticated request can clear frontend
 * auth state and redirect to /login, without http.ts depending on React/router directly.
 */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('Request timed out.', undefined, 'TIMEOUT');
  }
  if (error instanceof TypeError) {
    return new ApiError('Network error. Please check your connection.', undefined, 'NETWORK');
  }
  if (error instanceof Error) {
    return new ApiError(error.message, undefined, 'NETWORK');
  }
  return new ApiError('An unexpected error occurred', undefined, 'UNKNOWN');
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers: initHeaders, signal, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const method = (rest.method ?? 'GET').toUpperCase();
  if (!SAFE_METHODS.has(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
      // The session and CSRF cookies are HttpOnly/scoped — never read or sent manually.
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ?? AbortSignal.timeout(API_CONFIG.timeout),
    });
  } catch (error) {
    throw toApiError(error);
  }

  if (response.status === 401 && auth) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message || message;
    } catch {
      // keep status text
    }
    const code = response.status === 401 ? 'UNAUTHORIZED' : response.status >= 500 ? 'SERVER' : undefined;
    throw new ApiError(message || `Request failed (${response.status})`, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
