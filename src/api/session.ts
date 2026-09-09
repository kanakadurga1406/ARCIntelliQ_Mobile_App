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
