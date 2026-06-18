import { z } from 'zod';
import { SkillLevel } from '../enums';

export const SearchResult = z.object({
  type: z.enum(['profession', 'skill']),
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  level: z.nativeEnum(SkillLevel).nullable(),
});
export type SearchResult = z.infer<typeof SearchResult>;

export const SearchResponse = z.object({
  items: z.array(SearchResult),
  total: z.number(),
});
export type SearchResponse = z.infer<typeof SearchResponse>;
