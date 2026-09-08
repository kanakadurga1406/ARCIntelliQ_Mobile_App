import type {AuthSession} from '../types/auth';

export type PendingOtp = {
  email: string;
  userId: string;
};

let currentSession: AuthSession | null = null;
let pendingOtp: PendingOtp | null = null;

export function setSession(session: AuthSession): void {
  currentSession = session;
}

export function getSession(): AuthSession | null {
  return currentSession;
}

export function clearSession(): void {
  currentSession = null;
}

export function setPendingOtp(next: PendingOtp): void {
  pendingOtp = {
    email: next.email.trim(),
    userId: String(next.userId ?? '').trim(),
  };
}

export function getPendingOtp(): PendingOtp | null {
  return pendingOtp;
}

export function clearPendingOtp(): void {
  pendingOtp = null;
}
