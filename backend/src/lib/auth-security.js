import crypto from 'crypto';

const PASSWORD_ITERATIONS = 100000;
const PASSWORD_KEYLEN = 64;
const PASSWORD_DIGEST = 'sha512';

export function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEYLEN, PASSWORD_DIGEST).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  if (!salt || !hash) return false;
  const computedHash = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEYLEN, PASSWORD_DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function createAuthToken() {
  return crypto.randomBytes(48).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function buildExpiryDate(ttlMinutes) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + Number(ttlMinutes || 480));
  return expiresAt;
}
