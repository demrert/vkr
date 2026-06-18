import { z } from 'zod';
import { ProgressStatus } from '../enums';

export const ProgressEntry = z.object({
  skillId: z.string(),
  status: z.nativeEnum(ProgressStatus),
  updatedAt: z.string().datetime(),
});
export type ProgressEntry = z.infer<typeof ProgressEntry>;

export const UpdateProgressDto = z.object({
  status: z.nativeEnum(ProgressStatus).nullable(),
});
export type UpdateProgressDto = z.infer<typeof UpdateProgressDto>;

export const UserProgress = z.object({
  entries: z.array(ProgressEntry),
  stats: z.object({
    done: z.number(),
    doing: z.number(),
    planned: z.number(),
  }),
});
export type UserProgress = z.infer<typeof UserProgress>;
