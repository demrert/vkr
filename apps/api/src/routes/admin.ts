import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAdmin, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errors';

export const adminRouter: import('express').Router = Router();
adminRouter.use(requireAdmin);

const CreateProfessionDto = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  summary: z.string().min(1),
  salaryMedian: z.number().int().positive().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

adminRouter.get('/professions', async (_req, res, next) => {
  try {
    const professions = await prisma.profession.findMany({ orderBy: { title: 'asc' } });
    res.json(professions);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/professions', validate(CreateProfessionDto), async (req: AuthRequest, res, next) => {
  try {
    const data = req.body as z.infer<typeof CreateProfessionDto>;
    const existing = await prisma.profession.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError(409, 'SLUG_TAKEN', 'Profession with this slug already exists');

    const profession = await prisma.profession.create({
      data: { ...data, metadata: data.metadata as Prisma.InputJsonValue | undefined },
    });
    await prisma.contentChange.create({
      data: {
        entityType: 'Profession',
        entityId: profession.id,
        entityTitle: profession.title,
        action: 'add',
        adminEmail: req.user!.email,
      },
    });
    res.status(201).json(profession);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/professions/:id', validate(CreateProfessionDto.partial()), async (req: AuthRequest, res, next) => {
  try {
    const profession = await prisma.profession.update({
      where: { id: req.params['id'] },
      data: req.body,
    });
    await prisma.contentChange.create({
      data: {
        entityType: 'Profession',
        entityId: profession.id,
        entityTitle: profession.title,
        action: 'edit',
        diff: req.body,
        adminEmail: req.user!.email,
      },
    });
    res.json(profession);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/professions/:id', async (req: AuthRequest, res, next) => {
  try {
    const profession = await prisma.profession.findUnique({ where: { id: req.params['id'] } });
    if (!profession) throw new AppError(404, 'NOT_FOUND', 'Profession not found');
    await prisma.profession.delete({ where: { id: req.params['id'] } });
    await prisma.contentChange.create({
      data: {
        entityType: 'Profession',
        entityId: profession.id,
        entityTitle: profession.title,
        action: 'remove',
        adminEmail: req.user!.email,
      },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const SkillLevelEnum = z.enum(['Junior', 'Middle', 'Senior', 'Expert']);

const CreateSkillDto = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  level: SkillLevelEnum,
  category: z.string().min(1).max(100),
  metadata: z.record(z.unknown()).optional(),
});

adminRouter.get('/skills', async (_req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ level: 'asc' }, { title: 'asc' }],
      select: { id: true, slug: true, title: true, description: true, level: true, category: true },
    });
    res.json(skills);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/skills', validate(CreateSkillDto), async (req: AuthRequest, res, next) => {
  try {
    const data = req.body as z.infer<typeof CreateSkillDto>;
    const existing = await prisma.skill.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError(409, 'SLUG_TAKEN', 'Skill with this slug already exists');

    const skill = await prisma.skill.create({
      data: { ...data, metadata: data.metadata as Prisma.InputJsonValue | undefined },
    });
    await prisma.contentChange.create({
      data: {
        entityType: 'Skill',
        entityId: skill.id,
        entityTitle: skill.title,
        action: 'add',
        adminEmail: req.user!.email,
      },
    });
    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/skills/:id', validate(CreateSkillDto.partial()), async (req: AuthRequest, res, next) => {
  try {
    const skill = await prisma.skill.update({
      where: { id: req.params['id'] },
      data: req.body,
    });
    await prisma.contentChange.create({
      data: {
        entityType: 'Skill',
        entityId: skill.id,
        entityTitle: skill.title,
        action: 'edit',
        diff: req.body,
        adminEmail: req.user!.email,
      },
    });
    res.json(skill);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/skills/:id', async (req: AuthRequest, res, next) => {
  try {
    const skill = await prisma.skill.findUnique({ where: { id: req.params['id'] } });
    if (!skill) throw new AppError(404, 'NOT_FOUND', 'Skill not found');
    await prisma.skill.delete({ where: { id: req.params['id'] } });
    await prisma.contentChange.create({
      data: {
        entityType: 'Skill',
        entityId: skill.id,
        entityTitle: skill.title,
        action: 'remove',
        adminEmail: req.user!.email,
      },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const ResourceTypeEnum = z.enum(['article', 'video', 'course', 'book', 'docs', 'practice']);

const CreateResourceDto = z.object({
  title: z.string().min(1).max(300),
  url: z.string().url(),
  type: ResourceTypeEnum,
  language: z.string().min(1).max(10).default('ru'),
  description: z.string().optional(),
});

adminRouter.get('/resources', async (_req, res, next) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { title: 'asc' },
      include: {
        skillResources: {
          include: { skill: { select: { id: true, slug: true, title: true } } },
          orderBy: { priority: 'desc' },
        },
      },
    });
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/resources', validate(CreateResourceDto), async (req: AuthRequest, res, next) => {
  try {
    const data = req.body as z.infer<typeof CreateResourceDto>;
    const resource = await prisma.resource.create({ data });
    await prisma.contentChange.create({
      data: { entityType: 'Resource', entityId: resource.id, entityTitle: resource.title, action: 'add', adminEmail: req.user!.email },
    });
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/resources/:id', validate(CreateResourceDto.partial()), async (req: AuthRequest, res, next) => {
  try {
    const resource = await prisma.resource.update({ where: { id: req.params['id'] }, data: req.body });
    await prisma.contentChange.create({
      data: { entityType: 'Resource', entityId: resource.id, entityTitle: resource.title, action: 'edit', diff: req.body, adminEmail: req.user!.email },
    });
    res.json(resource);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/resources/:id', async (req: AuthRequest, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: req.params['id'] } });
    if (!resource) throw new AppError(404, 'NOT_FOUND', 'Resource not found');
    await prisma.resource.delete({ where: { id: req.params['id'] } });
    await prisma.contentChange.create({
      data: { entityType: 'Resource', entityId: resource.id, entityTitle: resource.title, action: 'remove', adminEmail: req.user!.email },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/resources/:id/link', async (req: AuthRequest, res, next) => {
  try {
    const resourceId = req.params['id']!;
    const { skillSlug, priority = 0 } = req.body as { skillSlug: string; priority?: number };
    if (!skillSlug) throw new AppError(400, 'MISSING_FIELD', 'skillSlug is required');
    const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } });
    if (!skill) throw new AppError(404, 'NOT_FOUND', `Skill '${skillSlug}' not found`);
    await prisma.skillResource.upsert({
      where: { skillId_resourceId: { skillId: skill.id, resourceId } },
      update: { priority },
      create: { skillId: skill.id, resourceId, priority },
    });
    res.json({ skillId: skill.id, slug: skill.slug, title: skill.title });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/resources/:resourceId/link/:skillId', async (req: AuthRequest, res, next) => {
  try {
    const resourceId = req.params['resourceId']!;
    const skillId = req.params['skillId']!;
    await prisma.skillResource.delete({
      where: { skillId_resourceId: { skillId, resourceId } },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/professions/:id/skills', async (req, res, next) => {
  try {
    const links = await prisma.professionSkill.findMany({
      where: { professionId: req.params['id'] },
      include: { skill: { select: { id: true, slug: true, title: true, level: true } } },
      orderBy: { importance: 'desc' },
    });
    res.json(links);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/professions/:id/skills', async (req: AuthRequest, res, next) => {
  try {
    const professionId = req.params['id']!;
    const { skillSlug, importance = 1, demandTier } = req.body as { skillSlug: string; importance?: number; demandTier?: string };
    if (!skillSlug) throw new AppError(400, 'MISSING_FIELD', 'skillSlug is required');
    const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } });
    if (!skill) throw new AppError(404, 'NOT_FOUND', `Skill '${skillSlug}' not found`);
    await prisma.professionSkill.upsert({
      where: { professionId_skillId: { professionId, skillId: skill.id } },
      update: { importance, demandTier: demandTier as any },
      create: { professionId, skillId: skill.id, importance, demandTier: demandTier as any },
    });
    res.json({ skillId: skill.id, slug: skill.slug, title: skill.title, level: skill.level });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/professions/:professionId/skills/:skillId', async (req, res, next) => {
  try {
    const { professionId, skillId } = req.params as { professionId: string; skillId: string };
    await prisma.professionSkill.delete({
      where: { professionId_skillId: { professionId, skillId } },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/skills/:id/prerequisites', async (req, res, next) => {
  try {
    const links = await prisma.skillPrerequisite.findMany({
      where: { skillId: req.params['id'] },
      include: { prerequisite: { select: { id: true, slug: true, title: true, level: true } } },
    });
    res.json(links);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/skills/:id/prerequisites', async (req: AuthRequest, res, next) => {
  try {
    const skillId = req.params['id']!;
    const { prerequisiteSlug } = req.body as { prerequisiteSlug: string };
    if (!prerequisiteSlug) throw new AppError(400, 'MISSING_FIELD', 'prerequisiteSlug is required');
    const prereq = await prisma.skill.findUnique({ where: { slug: prerequisiteSlug } });
    if (!prereq) throw new AppError(404, 'NOT_FOUND', `Skill '${prerequisiteSlug}' not found`);
    if (prereq.id === skillId) throw new AppError(400, 'SELF_REFERENCE', 'Skill cannot be its own prerequisite');
    await prisma.skillPrerequisite.upsert({
      where: { skillId_prerequisiteId: { skillId, prerequisiteId: prereq.id } },
      update: {},
      create: { skillId, prerequisiteId: prereq.id },
    });
    res.json({ prerequisiteId: prereq.id, slug: prereq.slug, title: prereq.title, level: prereq.level });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/skills/:skillId/prerequisites/:prereqId', async (req, res, next) => {
  try {
    const { skillId, prereqId } = req.params as { skillId: string; prereqId: string };
    await prisma.skillPrerequisite.delete({
      where: { skillId_prerequisiteId: { skillId, prerequisiteId: prereqId } },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
