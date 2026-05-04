// Este módulo sirve para: Gestionar los endpoints de autenticación: login, logout y registro/cierre de sesión de usuarios en el sistema.
// Elaborado por: Karla Vanessa Del Angel Santiago

import { Router } from 'express';
import { User } from '../models/index.js';
import {
  buildExpiryDate,
  createAuthToken,
  hashToken,
  verifyPassword,
} from '../lib/auth-security.js';
import { env } from '../config/env.js';

const router = Router();

async function getActiveUserByToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const tokenHash = hashToken(token);
  const user = await User.findOne({ where: { currentTokenHash: tokenHash, status: true } });
  if (!user) return null;

  if (!user.tokenExpiresAt || new Date(user.tokenExpiresAt).getTime() < Date.now()) return null;

  return user;
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(422).json({ message: 'username y password son obligatorios.' });
    }

    const user = await User.findOne({ where: { username, status: true } });
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const token = createAuthToken();
    user.currentTokenHash = hashToken(token);
    user.tokenExpiresAt = buildExpiryDate(env.auth.tokenTtlMinutes);
    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
      },
      expires_at: user.tokenExpiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const user = await getActiveUserByToken(req);
    if (!user) return res.status(200).json({ status: true });

    user.currentTokenHash = null;
    user.tokenExpiresAt = null;
    await user.save();

    return res.json({ status: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const user = await getActiveUserByToken(req);
    if (!user) return res.status(401).json({ message: 'No autorizado.' });

    const token = createAuthToken();
    user.currentTokenHash = hashToken(token);
    user.tokenExpiresAt = buildExpiryDate(env.auth.tokenTtlMinutes);
    await user.save();

    return res.json({ token, expires_at: user.tokenExpiresAt });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/session-status', async (req, res) => {
  try {
    const user = await getActiveUserByToken(req);
    if (!user) return res.json({ active: false, reason: 'invalid_or_expired' });

    return res.json({
      active: true,
      reason: null,
      expires_at: user.tokenExpiresAt,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (_error) {
    return res.json({ active: false, reason: 'error' });
  }
});

router.post('/close-session', async (req, res) => {
  try {
    const user = await getActiveUserByToken(req);
    if (!user) return res.status(200).json({ status: true, updated: false });

    user.currentTokenHash = null;
    user.tokenExpiresAt = null;
    await user.save();

    return res.json({ status: true, updated: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/keep-alive', async (req, res) => {
  try {
    const user = await getActiveUserByToken(req);
    if (!user) return res.status(401).json({ status: false });

    user.tokenExpiresAt = buildExpiryDate(env.auth.tokenTtlMinutes);
    await user.save();

    return res.json({ status: true, expires_at: user.tokenExpiresAt });
  } catch (_error) {
    return res.status(500).json({ status: false });
  }
});

export default router;
