import { Router } from 'express';
import bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from '@skillatlas/shared';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errors';

export const authRouter: import('express').Router = Router();

authRouter.post('/register', validate(RegisterDto), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as RegisterDto;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'EMAIL_TAKEN', 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validate(LoginDto), async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginDto;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.json({ ok: true });
});
