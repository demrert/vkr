import { Router } from 'express';
import { z } from 'zod';
import { PaginationQuery } from '@skillatlas/shared';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errors';

export const professionsRouter: import('express').Router = Router();

const FilterQuery = PaginationQuery.extend({
  q: z.string().optional(),
});

professionsRouter.get('/', validate(FilterQuery, 'query'), async (req, res, next) => {
  try {
    const { page, pageSize, q } = req.query as unknown as z.infer<typeof FilterQuery>;
    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { summary: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.profession.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { title: 'asc' },
        include: { _count: { select: { professionSkills: true } } },
      }),
      prisma.profession.count({ where }),
    ]);

    res.json({
      items: items.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        salaryMedian: p.salaryMedian,
        skillCount: p._count.professionSkills,
      })),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});

professionsRouter.get('/compare', async (req, res, next) => {
  try {
    const { a, b } = req.query as { a?: string; b?: string };
    if (!a || !b) throw new AppError(400, 'BAD_REQUEST', 'Query params a and b are required');

    const [profA, profB] = await Promise.all([
      fetchProfessionDetail(a),
      fetchProfessionDetail(b),
    ]);

    const idsA = new Set(profA.skills.map((s) => s.id));
    const commonSkillIds = profB.skills.filter((s) => idsA.has(s.id)).map((s) => s.id);

    res.json({ a: profA, b: profB, commonSkillIds });
  } catch (err) {
    next(err);
  }
});

professionsRouter.get('/:slug', async (req, res, next) => {
  try {
    const profession = await fetchProfessionDetail(req.params['slug']!);
    res.json(profession);
  } catch (err) {
    next(err);
  }
});

async function fetchProfessionDetail(slug: string) {
  const profession = await prisma.profession.findUnique({
    where: { slug },
    include: {
      professionSkills: {
        include: {
          skill: {
            include: {
              skillTags: { include: { tag: true } },
              prerequisites: { select: { prerequisiteId: true } },
            },
          },
        },
        orderBy: { importance: 'desc' },
      },
    },
  });

  if (!profession) throw new AppError(404, 'NOT_FOUND', 'Profession not found');

  return {
    id: profession.id,
    slug: profession.slug,
    title: profession.title,
    summary: profession.summary,
    salaryMedian: profession.salaryMedian,
    metadata: profession.metadata,
    skills: profession.professionSkills.map(({ skill, importance, demandTier }) => ({
      id: skill.id,
      slug: skill.slug,
      title: skill.title,
      level: skill.level,
      category: skill.category,
      description: skill.description,
      importance,
      demandTier,
      tags: skill.skillTags.map(({ tag }) => ({ id: tag.id, name: tag.name, color: tag.color })),
      prerequisites: skill.prerequisites.map((p) => p.prerequisiteId),
    })),
  };
}
