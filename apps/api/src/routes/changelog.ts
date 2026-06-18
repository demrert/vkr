import { Router } from 'express';
import { PaginationQuery } from '@skillatlas/shared';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';

export const changelogRouter: import('express').Router = Router();

changelogRouter.get('/', validate(PaginationQuery, 'query'), async (req, res, next) => {
  try {
    const { page, pageSize } = req.query as unknown as { page: number; pageSize: number };

    const [items, total] = await Promise.all([
      prisma.contentChange.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contentChange.count(),
    ]);

    res.json({
      items: items.map((c: (typeof items)[number]) => ({
        id: c.id,
        entityType: c.entityType,
        entityId: c.entityId,
        entityTitle: c.entityTitle,
        action: c.action,
        diff: c.diff,
        createdAt: c.createdAt.toISOString(),
        adminEmail: c.adminEmail,
      })),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});
