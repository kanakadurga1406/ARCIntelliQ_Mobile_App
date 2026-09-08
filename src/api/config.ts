/**
 * Live backend. Screens call src/api/*; those modules hit these URLs
 * when USE_STUB_API is false.
 *
 * Claim Handler sign-in is the Laravel web form:
 * GET  /admin  → CSRF + session cookies
 * POST /login  → email, password, portal=unified, _token
 */
export const USE_STUB_API = false;

export const API_ORIGIN = 'https://arcintelliq.arcclaimsportal.com';

export const API_BASE_URL = `${API_ORIGIN}/mobile`;

export const LOGIN_PAGE_URL = `${API_ORIGIN}/admin`;

export const LOGIN_URL = `${API_ORIGIN}/login`;

export const LOGIN_API_URL = `${API_BASE_URL}/login`;

export const OTP_URL = `${API_BASE_URL}/otp/verify`;

export const OTP_RESEND_URL = `${API_BASE_URL}/otp/resend`;

export const FORGOT_PASSWORD_URL = `${API_ORIGIN}/forgot-password`;
