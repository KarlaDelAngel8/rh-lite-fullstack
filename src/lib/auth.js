const TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_STORAGE_KEY = 'auth_user';

function findTokenCandidate(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const directKeys = ['token', 'access_token', 'jwt', 'id_token'];
  for (const key of directKeys) {
    const candidate = payload[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }

  if (payload.data && typeof payload.data === 'object') {
    return findTokenCandidate(payload.data);
  }

  if (payload.result && typeof payload.result === 'object') {
    return findTokenCandidate(payload.result);
  }

  return null;
}

function findUserCandidate(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const user = payload.user || payload.usuario || payload.profile || null;
  if (user && typeof user === 'object') return user;

  if (payload.data && typeof payload.data === 'object') {
    return findUserCandidate(payload.data);
  }

  if (payload.result && typeof payload.result === 'object') {
    return findUserCandidate(payload.result);
  }

  return null;
}

export function extractTokenFromPayload(payload) {
  return findTokenCandidate(payload);
}

export function setAuthSession(payload) {
  const token = extractTokenFromPayload(payload);
  if (!token) return null;

  localStorage.setItem(TOKEN_STORAGE_KEY, token);

  const user = findUserCandidate(payload);
  if (user) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  }

  return token;
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export function hasAuthSession() {
  return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
