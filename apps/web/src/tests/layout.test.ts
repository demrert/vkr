import { describe, it, expect } from 'vitest';
import { layoutSkillGraph } from '../features/graph/layout';
import type { SkillNode } from '@skillatlas/shared';

const mockSkills: SkillNode[] = [
  {
    id: '1',
    slug: 'programming-basics',
    title: 'Основы программирования',
    level: 'Junior',
    category: 'core',
    description: '',
    importance: 10,
    demandTier: 'S',
    tags: [],
    prerequisites: [],
  },
  {
    id: '2',
    slug: 'nodejs',
    title: 'Node.js',
    level: 'Middle',
    category: 'backend',
    description: '',
    importance: 8,
    demandTier: 'A',
    tags: [],
    prerequisites: ['1'],
  },
];

describe('layoutSkillGraph', () => {
  it('places Junior nodes before Middle', () => {
    const { nodes } = layoutSkillGraph(mockSkills);
    const junior = nodes.find((n) => n.id === '1');
    const middle = nodes.find((n) => n.id === '2');
    expect(junior!.position.x).toBeLessThan(middle!.position.x);
  });

  it('creates edges for prerequisites', () => {
    const { edges } = layoutSkillGraph(mockSkills);
    expect(edges).toHaveLength(1);
    expect(edges[0]!.source).toBe('1');
    expect(edges[0]!.target).toBe('2');
  });
});
