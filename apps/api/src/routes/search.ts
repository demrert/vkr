import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';

export const searchRouter: import('express').Router = Router();

const SearchQuery = z.object({ q: z.string().min(1).max(200) });

searchRouter.get('/', validate(SearchQuery, 'query'), async (req, res, next) => {
  try {
    const { q } = req.query as z.infer<typeof SearchQuery>;

    const [professions, skills] = await Promise.all([
      prisma.profession.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, slug: true, title: true, summary: true },
      }),
      prisma.skill.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 20,
        select: { id: true, slug: true, title: true, description: true, level: true },
      }),
    ]);

    const items = [
      ...professions.map((p) => ({
        type: 'profession' as const,
        id: p.id,
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        level: null,
      })),
      ...skills.map((s) => ({
        type: 'skill' as const,
        id: s.id,
        slug: s.slug,
        title: s.title,
        summary: s.description,
        level: s.level,
      })),
    ];

    res.json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
});
