import type {
  AuthSession,
  ClaimHandlerAccount,
  ClaimHandlerUser,
  LoginCredentials,
} from '../types/auth';
import {USE_STUB_API} from './config';
import {ApiError, apiRequest} from './client';
import {CLAIM_HANDLER_USERS} from './stubs/claimHandlers';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function toPublicUser(user: ClaimHandlerAccount): ClaimHandlerUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
  };
}

async function stubClaimHandlerLogin({
  email,
  password,
}: LoginCredentials): Promise<AuthSession> {
  await wait(700);

  const normalizedEmail = email.trim().toLowerCase();
  const user = CLAIM_HANDLER_USERS.find(
    item => item.email.toLowerCase() === normalizedEmail,
  );

  if (!user || user.password !== password) {
    throw new ApiError('Invalid email or password', 401);
  }

  return {
    token: `stub-token-${user.id}`,
    user: toPublicUser(user),
  };
}

async function liveClaimHandlerLogin(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/claim-handler/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function loginClaimHandler(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  if (USE_STUB_API) {
    return stubClaimHandlerLogin(credentials);
  }

  return liveClaimHandlerLogin(credentials);
}
