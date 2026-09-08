import type {
  AuthSession,
  ClaimHandlerAccount,
  ClaimHandlerUser,
  LoginCredentials,
  OtpChallenge,
  PasswordResetRequest,
  PasswordResetResult,
  ResendOtpPayload,
  VerifyOtpPayload,
} from '../types/auth';
import {USE_STUB_API} from './config';
import {ApiError, apiRequest} from './client';
import {CLAIM_HANDLER_USERS, STUB_OTP_CODE} from './stubs/claimHandlers';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

type StubChallenge = {
  challengeId: string;
  email: string;
  userId: string;
  code: string;
  expiresAt: number;
};

const stubChallenges = new Map<string, StubChallenge>();

function toPublicUser(user: ClaimHandlerAccount): ClaimHandlerUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
  };
}

function findUser(email: string, password: string): ClaimHandlerAccount {
  const normalizedEmail = email.trim().toLowerCase();
  const user = CLAIM_HANDLER_USERS.find(
    item => item.email.toLowerCase() === normalizedEmail,
  );

  if (!user || user.password !== password) {
    throw new ApiError('Invalid email or password', 401);
  }

  return user;
}

function createChallenge(user: ClaimHandlerAccount): OtpChallenge {
  const challengeId = `otp-${user.id}-${Date.now()}`;
  stubChallenges.set(challengeId, {
    challengeId,
    email: user.email,
    userId: user.id,
    code: STUB_OTP_CODE,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return {
    challengeId,
    email: user.email,
    expiresIn: 300,
  };
}

function requireChallenge(challengeId: string): StubChallenge {
  const record = stubChallenges.get(challengeId);
  if (!record || Date.now() > record.expiresAt) {
    throw new ApiError('This code has expired. Please request a new one.', 401);
  }
  return record;
}

async function stubStartLogin(credentials: LoginCredentials): Promise<OtpChallenge> {
  await wait(700);
  return createChallenge(findUser(credentials.email, credentials.password));
}

async function stubVerifyOtp({
  challengeId,
  code,
}: VerifyOtpPayload): Promise<AuthSession> {
  await wait(650);
  const record = requireChallenge(challengeId);
  if (record.code !== code.trim()) {
    throw new ApiError('Invalid verification code', 401);
  }

  const user = CLAIM_HANDLER_USERS.find(item => item.id === record.userId);
  if (!user) {
    throw new ApiError('Unable to complete verification.', 401);
  }

  stubChallenges.delete(challengeId);
  return {
    token: `stub-token-${user.id}`,
    user: toPublicUser(user),
  };
}

async function stubResendOtp({
  challengeId,
}: ResendOtpPayload): Promise<OtpChallenge> {
  await wait(500);
  const record = requireChallenge(challengeId);
  const user = CLAIM_HANDLER_USERS.find(item => item.id === record.userId);
  if (!user) {
    throw new ApiError('Unable to resend the code.', 401);
  }
  stubChallenges.delete(challengeId);
  return createChallenge(user);
}

async function stubClaimHandlerLogin(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  await wait(700);
  const user = findUser(credentials.email, credentials.password);
  return {
    token: `stub-token-${user.id}`,
    user: toPublicUser(user),
  };
}

export function startClaimHandlerLogin(
  credentials: LoginCredentials,
): Promise<OtpChallenge> {
  if (USE_STUB_API) {
    return stubStartLogin(credentials);
  }

  return apiRequest<OtpChallenge>('/auth/claim-handler/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function verifyClaimHandlerOtp(
  payload: VerifyOtpPayload,
): Promise<AuthSession> {
  if (USE_STUB_API) {
    return stubVerifyOtp(payload);
  }

  return apiRequest<AuthSession>('/auth/claim-handler/otp/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resendClaimHandlerOtp(
  payload: ResendOtpPayload,
): Promise<OtpChallenge> {
  if (USE_STUB_API) {
    return stubResendOtp(payload);
  }

  return apiRequest<OtpChallenge>('/auth/claim-handler/otp/resend', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function stubPasswordReset({
  email,
}: PasswordResetRequest): Promise<PasswordResetResult> {
  await wait(650);
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new ApiError('Enter a valid email address.', 400);
  }

  return {
    message:
      'If that email is on an ARCIntelliQ account, a set-password link is on its way. The link expires in 60 minutes.',
  };
}

export function requestPasswordReset(
  payload: PasswordResetRequest,
): Promise<PasswordResetResult> {
  if (USE_STUB_API) {
    return stubPasswordReset(payload);
  }

  return apiRequest<PasswordResetResult>('/auth/claim-handler/password/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginClaimHandler(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  if (USE_STUB_API) {
    return stubClaimHandlerLogin(credentials);
  }

  return apiRequest<AuthSession>('/auth/claim-handler/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
