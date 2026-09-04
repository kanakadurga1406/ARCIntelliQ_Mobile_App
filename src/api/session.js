let currentSession = null;

export function setSession(session) {
  currentSession = session;
}

export function getSession() {
  return currentSession;
}

export function clearSession() {
  currentSession = null;
}
