import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errors';

export const skillsRouter: import('express').Router = Router();

skillsRouter.get('/:slug', async (req, res, next) => {
  try {
    const skill = await prisma.skill.findUnique({
      where: { slug: req.params['slug'] },
      include: {
        skillTags: { include: { tag: true } },
        skillResources: {
          include: { resource: true },
          orderBy: { priority: 'desc' },
        },
        prerequisites: {
          include: { prerequisite: { select: { id: true, slug: true, title: true } } },
        },
        dependants: {
          include: { skill: { select: { id: true, slug: true, title: true } } },
        },
      },
    });

    if (!skill) throw new AppError(404, 'NOT_FOUND', 'Skill not found');

    res.json({
      id: skill.id,
      slug: skill.slug,
      title: skill.title,
      description: skill.description,
      level: skill.level,
      category: skill.category,
      metadata: skill.metadata,
      tags: skill.skillTags.map(({ tag }) => ({ id: tag.id, name: tag.name, color: tag.color })),
      resources: skill.skillResources.map(({ resource, priority }) => ({
        id: resource.id,
        title: resource.title,
        url: resource.url,
        type: resource.type,
        language: resource.language,
        description: resource.description,
        priority,
      })),
      prerequisites: skill.prerequisites.map(({ prerequisite }) => prerequisite),
      dependants: skill.dependants.map(({ skill: dep }) => dep),
    });
  } catch (err) {
    next(err);
  }
});
