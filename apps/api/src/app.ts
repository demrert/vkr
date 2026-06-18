import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { professionsRouter } from './routes/professions';
import { skillsRouter } from './routes/skills';
import { progressRouter } from './routes/progress';
import { searchRouter } from './routes/search';
import { changelogRouter } from './routes/changelog';
import { adminRouter } from './routes/admin';
import { tagsRouter } from './routes/tags';
import { errorHandler, notFound } from './middleware/errors';

export function createApp(): import('express').Express {
  const app = express();

  app.use(
    cors({
      origin: process.env['CLIENT_URL'] ?? 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/professions', professionsRouter);
  app.use('/api/v1/skills', skillsRouter);
  app.use('/api/v1/progress', progressRouter);
  app.use('/api/v1/search', searchRouter);
  app.use('/api/v1/changelog', changelogRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/tags', tagsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
