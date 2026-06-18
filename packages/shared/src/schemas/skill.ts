import { z } from 'zod';
import { SkillLevel, ResourceType } from '../enums';

export const ResourceItem = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  type: z.nativeEnum(ResourceType),
  language: z.string(),
  description: z.string().nullable(),
  priority: z.number(),
});
export type ResourceItem = z.infer<typeof ResourceItem>;

export const SkillDetail = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.nativeEnum(SkillLevel),
  category: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  tags: z.array(z.object({ id: z.string(), name: z.string(), color: z.string() })),
  resources: z.array(ResourceItem),
  prerequisites: z.array(z.object({ id: z.string(), slug: z.string(), title: z.string() })),
  dependants: z.array(z.object({ id: z.string(), slug: z.string(), title: z.string() })),
});
export type SkillDetail = z.infer<typeof SkillDetail>;
