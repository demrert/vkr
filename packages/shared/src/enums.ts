export const SkillLevel = {
  Junior: 'Junior',
  Middle: 'Middle',
  Senior: 'Senior',
  Expert: 'Expert',
} as const;
export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];

export const ProgressStatus = {
  done: 'done',
  doing: 'doing',
  planned: 'planned',
} as const;
export type ProgressStatus = (typeof ProgressStatus)[keyof typeof ProgressStatus];

export const ResourceType = {
  article: 'article',
  video: 'video',
  course: 'course',
  book: 'book',
  docs: 'docs',
  practice: 'practice',
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const DemandTier = {
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
} as const;
export type DemandTier = (typeof DemandTier)[keyof typeof DemandTier];

export const ChangeAction = {
  add: 'add',
  edit: 'edit',
  remove: 'remove',
} as const;
export type ChangeAction = (typeof ChangeAction)[keyof typeof ChangeAction];
