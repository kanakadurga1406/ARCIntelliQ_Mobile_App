import type {
  ResetUserPasswordPayload,
  ResetUserPasswordResult,
  SendResetPasswordLinkPayload,
  SendResetPasswordLinkResult,
} from '../types/users';
import {ApiError, apiRequest, readMessage} from './client';
import {getSession} from './session';

function requireSessionToken(): string {
  const token = getSession()?.token?.trim();
  if (!token || token === 'session') {
    throw new ApiError(
      'Your session expired. Sign in again to reset a password.',
      401,
    );
  }
  return token;
}

export async function resetUserPassword(
  payload: ResetUserPasswordPayload,
): Promise<ResetUserPasswordResult> {
  const token = requireSessionToken();
  const email = payload.email.trim();
  const newPassword = payload.new_password;
  const confirmation = payload.new_password_confirmation ?? newPassword;
  if (!email || !newPassword) {
    throw new ApiError('Email and new password are required.', 422);
  }

  const data = await apiRequest<unknown>('/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
      new_password: newPassword,
      new_password_confirmation: confirmation,
      token,
    }),
  });

  return {
    message: readMessage(data, 'Password was updated.'),
  };
}

export async function sendResetPasswordLink(
  payload: SendResetPasswordLinkPayload,
): Promise<SendResetPasswordLinkResult> {
  const token = requireSessionToken();
  const email = payload.email.trim();
  if (!email) {
    throw new ApiError('Email is required.', 422);
  }

  const data = await apiRequest<unknown>('/reset-password/send-link', {
    method: 'POST',
    body: JSON.stringify({
      email,
      token,
    }),
  });

  return {
    message: readMessage(data, 'A reset link was sent.'),
  };
}
