import type {AuthSession} from '../types/auth';
import type {NavItem} from '../types/claimPortals';

export type PendingOtp = {
  email: string;
  userId: string;
};

export type EnteredPortal = {
  businessId: string;
  businessName: string;
  logoUrl: string;
  menu: NavItem[];
};

let currentSession: AuthSession | null = null;
let pendingOtp: PendingOtp | null = null;
let loginUserId = '';
let enteredPortal: EnteredPortal | null = null;

export function setSession(session: AuthSession): void {
  currentSession = session;
}

export function getSession(): AuthSession | null {
  return currentSession;
}

export function clearSession(): void {
  currentSession = null;
  enteredPortal = null;
}

export function setEnteredPortal(next: EnteredPortal): void {
  enteredPortal = next;
}

export function getEnteredPortal(): EnteredPortal | null {
  return enteredPortal;
}

export function clearEnteredPortal(): void {
  enteredPortal = null;
}

type ArcOtpStore = {
  __arcPendingOtp?: PendingOtp | null;
  __arcLoginUserId?: string;
};

function otpStore(): ArcOtpStore {
  return globalThis as typeof globalThis & ArcOtpStore;
}

export function setPendingOtp(next: PendingOtp): void {
  loginUserId = String(next.userId ?? '').trim();
  pendingOtp = {
    email: next.email.trim(),
    userId: loginUserId,
  };
  const store = otpStore();
  store.__arcPendingOtp = pendingOtp;
  store.__arcLoginUserId = loginUserId;
}

export function getPendingOtp(): PendingOtp | null {
  return pendingOtp ?? otpStore().__arcPendingOtp ?? null;
}

export function setLoginUserId(userId: string | number): void {
  loginUserId = String(userId ?? '').trim();
  pendingOtp = {
    email: pendingOtp?.email || otpStore().__arcPendingOtp?.email || '',
    userId: loginUserId,
  };
  const store = otpStore();
  store.__arcPendingOtp = pendingOtp;
  store.__arcLoginUserId = loginUserId;
}

export function getLoginUserId(): string {
  return (
    loginUserId ||
    otpStore().__arcLoginUserId ||
    otpStore().__arcPendingOtp?.userId ||
    ''
  );
}

export function clearPendingOtp(): void {
  pendingOtp = null;
  loginUserId = '';
  const store = otpStore();
  store.__arcPendingOtp = null;
  store.__arcLoginUserId = '';
}
