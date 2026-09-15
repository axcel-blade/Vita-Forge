export {
  register,
  login,
  getProfile as getAuthProfile,
  logout,
  listSessions,
  revokeSession,
  updateAccount,
  changePassword,
} from './auth';
export {
  uploadProfile,
  getProfile as getUserProfile,
  deleteProfile,
} from './user';
export { API_BASE_URL, API_TIMEOUT, API_CONFIG } from './config';
export { apiRequest } from './http';
export { generateResumeSummary, generateCoverLetter, aiApiClient } from './ai';
export { ApiError, isApiError, formatErrorMessage } from './error-handling';
export type {
  LoginData,
  RegisterData,
  AuthResponse,
  Session,
  UpdateAccountData,
  ChangePasswordData,
} from './auth';
