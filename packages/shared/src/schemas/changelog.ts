import { z } from 'zod';
import { ChangeAction } from '../enums';

export const ChangelogEntry = z.object({
  id: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  entityTitle: z.string(),
  action: z.nativeEnum(ChangeAction),
  diff: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  adminEmail: z.string().nullable(),
});
export type ChangelogEntry = z.infer<typeof ChangelogEntry>;

export const PaginatedChangelog = z.object({
  items: z.array(ChangelogEntry),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type PaginatedChangelog = z.infer<typeof PaginatedChangelog>;
