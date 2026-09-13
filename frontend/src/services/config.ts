export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001/api/v1';

export const API_TIMEOUT = 10_000;

export const API_CONFIG = {
  timeout: API_TIMEOUT,
  baseURL: API_BASE_URL,
};
