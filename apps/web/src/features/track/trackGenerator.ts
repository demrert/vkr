import type { SkillNode } from '@skillatlas/shared';

export function buildTrack(
  targetSkillId: string,
  allSkills: SkillNode[],
  doneSkillIds: Set<string>
): string[] {
  const skillMap = new Map<string, SkillNode>(allSkills.map((s) => [s.id, s]));

  const visited = new Set<string>();
  const queue: string[] = [targetSkillId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const skill = skillMap.get(current);
    if (skill) {
      for (const prereqId of skill.prerequisites) {
        if (!visited.has(prereqId)) {
          queue.push(prereqId);
        }
      }
    }
  }

  const toLearn = new Set<string>();
  for (const id of visited) {
    if (id === targetSkillId || !doneSkillIds.has(id)) {
      toLearn.add(id);
    }
  }

  const inDegree = new Map<string, number>();
  const adjFrom = new Map<string, string[]>();

  for (const id of toLearn) {
    if (!inDegree.has(id)) inDegree.set(id, 0);
    if (!adjFrom.has(id)) adjFrom.set(id, []);
  }

  for (const id of toLearn) {
    const skill = skillMap.get(id);
    if (!skill) continue;
    for (const prereqId of skill.prerequisites) {
      if (!toLearn.has(prereqId)) continue;
      const deps = adjFrom.get(prereqId) ?? [];
      deps.push(id);
      adjFrom.set(prereqId, deps);
      inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
    }
  }

  const sortQueue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) sortQueue.push(id);
  }

  const sorted: string[] = [];
  while (sortQueue.length > 0) {
    sortQueue.sort();
    const current = sortQueue.shift()!;
    sorted.push(current);

    for (const dep of adjFrom.get(current) ?? []) {
      const newDeg = (inDegree.get(dep) ?? 1) - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) {
        sortQueue.push(dep);
      }
    }
  }

  for (const id of toLearn) {
    if (!sorted.includes(id)) {
      sorted.push(id);
    }
  }

  return sorted;
}
