import type {AuthSession} from '../types/auth';

let currentSession: AuthSession | null = null;

export function setSession(session: AuthSession): void {
  currentSession = session;
}

export function getSession(): AuthSession | null {
  return currentSession;
}

export function clearSession(): void {
  currentSession = null;
}
