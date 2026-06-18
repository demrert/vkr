import { Router } from 'express';
import { z } from 'zod';
import { UpdateProgressDto } from '@skillatlas/shared';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errors';

export const progressRouter: import('express').Router = Router();

progressRouter.use(requireAuth);

progressRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const entries = await prisma.progress.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
    });

    const stats = entries.reduce(
      (acc, e) => {
        acc[e.status] = (acc[e.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    res.json({
      entries: entries.map((e) => ({
        skillId: e.skillId,
        status: e.status,
        updatedAt: e.updatedAt.toISOString(),
      })),
      stats: { done: stats['done'] ?? 0, doing: stats['doing'] ?? 0, planned: stats['planned'] ?? 0 },
    });
  } catch (err) {
    next(err);
  }
});

const ParamSchema = z.object({ skillId: z.string().min(1) });

progressRouter.put('/:skillId', validate(ParamSchema, 'params'), validate(UpdateProgressDto), async (req: AuthRequest, res, next) => {
  try {
    const { skillId } = req.params as z.infer<typeof ParamSchema>;
    const { status } = req.body as UpdateProgressDto;

    const skillExists = await prisma.skill.findUnique({ where: { id: skillId }, select: { id: true } });
    if (!skillExists) throw new AppError(404, 'NOT_FOUND', 'Skill not found');

    if (status === null) {
      await prisma.progress.deleteMany({ where: { userId: req.user!.id, skillId } });
      res.json({ ok: true });
      return;
    }

    const entry = await prisma.progress.upsert({
      where: { userId_skillId: { userId: req.user!.id, skillId } },
      create: { userId: req.user!.id, skillId, status },
      update: { status },
    });

    res.json({ skillId: entry.skillId, status: entry.status, updatedAt: entry.updatedAt.toISOString() });
  } catch (err) {
    next(err);
  }
});
