import { z } from 'zod';
import { SkillLevel, DemandTier } from '../enums';

export const ProfessionSummary = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  salaryMedian: z.number().nullable(),
  skillCount: z.number(),
});
export type ProfessionSummary = z.infer<typeof ProfessionSummary>;

export const SkillNode = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  level: z.nativeEnum(SkillLevel),
  category: z.string(),
  description: z.string(),
  importance: z.number(),
  demandTier: z.nativeEnum(DemandTier),
  tags: z.array(z.object({ id: z.string(), name: z.string(), color: z.string() })),
  prerequisites: z.array(z.string()),
});
export type SkillNode = z.infer<typeof SkillNode>;

export const ProfessionDetail = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  salaryMedian: z.number().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  skills: z.array(SkillNode),
});
export type ProfessionDetail = z.infer<typeof ProfessionDetail>;

export const ProfessionCompare = z.object({
  a: ProfessionDetail,
  b: ProfessionDetail,
  commonSkillIds: z.array(z.string()),
});
export type ProfessionCompare = z.infer<typeof ProfessionCompare>;

export const PaginatedProfessions = z.object({
  items: z.array(ProfessionSummary),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type PaginatedProfessions = z.infer<typeof PaginatedProfessions>;
