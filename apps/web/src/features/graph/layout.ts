import type { Node, Edge } from '@xyflow/react';
import type { SkillNode } from '@skillatlas/shared';
import type { SkillNodeData } from './SkillNodeComponent';
import type { LevelZoneData } from './LevelZoneNode';

const LEVEL_ORDER = ['Junior', 'Middle', 'Senior', 'Expert'] as const;
const LANE_WIDTH = 280;
const NODE_HEIGHT = 70;
const NODE_GAP = 20;
const START_X = 40;
const ZONE_PADDING_TOP = 36;
const ZONE_PADDING_BOTTOM = 24;
const ZONE_PADDING_X = 20;

const LEVEL_COLORS: Record<string, string> = {
  Junior: '#22c55e',
  Middle: '#3b82f6',
  Senior: '#f59e0b',
  Expert: '#ef4444',
};

export function layoutSkillGraph(skills: SkillNode[]): { nodes: Node[]; edges: Edge[] } {
  const byLevel = LEVEL_ORDER.map((level) => skills.filter((s) => s.level === level));

  const skillNodes: Node[] = [];
  const zoneNodes: Node[] = [];

  byLevel.forEach((group, laneIdx) => {
    const level = LEVEL_ORDER[laneIdx]!;
    const x = START_X + laneIdx * LANE_WIDTH;

    group.forEach((skill, i) => {
      const y = ZONE_PADDING_TOP + i * (NODE_HEIGHT + NODE_GAP);
      skillNodes.push({
        id: skill.id,
        type: 'skill',
        position: { x, y },
        zIndex: 0,
        data: {
          id: skill.id,
          label: skill.title,
          slug: skill.slug,
          level: skill.level,
          category: skill.category,
          importance: skill.importance,
        } satisfies SkillNodeData,
      });
    });

    if (group.length === 0) return;

    const zoneHeight =
      ZONE_PADDING_TOP +
      group.length * (NODE_HEIGHT + NODE_GAP) -
      NODE_GAP +
      ZONE_PADDING_BOTTOM;

    zoneNodes.push({
      id: `zone-${level}`,
      type: 'levelZone',
      position: { x: x - ZONE_PADDING_X, y: 0 },
      zIndex: -1,
      selectable: false,
      draggable: false,
      focusable: false,
      style: { width: LANE_WIDTH - ZONE_PADDING_X, height: zoneHeight },
      data: {
        label: level,
        color: LEVEL_COLORS[level] ?? '#6366f1',
      } satisfies LevelZoneData,
    });
  });

  const edges: Edge[] = skills.flatMap((skill) =>
    skill.prerequisites.map((prereqId) => ({
      id: `${prereqId}->${skill.id}`,
      source: prereqId,
      target: skill.id,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    }))
  );

  return { nodes: [...zoneNodes, ...skillNodes], edges };
}
