import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const tagsRouter: import('express').Router = Router();

tagsRouter.get('/', async (_req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    res.json(tags);
  } catch (err) {
    next(err);
  }
});
