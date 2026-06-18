import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo, useEffect } from 'react';
import type { SkillNode as SkillNodeType } from '@skillatlas/shared';
import { SkillNodeComponent } from './SkillNodeComponent';
import { LevelZoneNode } from './LevelZoneNode';
import { layoutSkillGraph } from './layout';

interface Props {
  skills: SkillNodeType[];
  trackNodeIds?: Set<string>;
  targetSkillId?: string;
  demandTiers?: Record<string, string>;
  onSkillClick?: (skillId: string) => void;
}

const nodeTypes = {
  skill: SkillNodeComponent,
  levelZone: LevelZoneNode,
};

const TIER_COLORS: Record<string, string> = {
  S: '#dc2626',
  A: '#ea580c',
  B: '#ca8a04',
  C: '#2563eb',
  D: '#6b7280',
};

export function SkillGraph({
  skills,
  trackNodeIds,
  targetSkillId,
  demandTiers,
  onSkillClick,
}: Props) {
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => layoutSkillGraph(skills),
    [skills]
  );

  const enrichedNodes = useMemo<Node[]>(() => {
    return layoutNodes.map((node) => {
      if (node.type !== 'skill') return node;

      const skillId = node.id;
      const inTrack = trackNodeIds ? trackNodeIds.has(skillId) : undefined;
      const isTarget = targetSkillId === skillId;

      let tierColor: string | undefined;
      let tierLabel: string | undefined;

      if (demandTiers) {
        const tier = demandTiers[skillId];
        if (tier && TIER_COLORS[tier]) {
          tierColor = TIER_COLORS[tier]!;
          tierLabel = tier;
        }
      }

      return {
        ...node,
        data: {
          ...node.data,
          dimmed: trackNodeIds !== undefined && !inTrack,
          isTarget,
          tierColor,
          tierLabel,
          onNodeClick: onSkillClick,
        },
      };
    });
  }, [layoutNodes, trackNodeIds, targetSkillId, demandTiers, onSkillClick]);

  const enrichedEdges = useMemo<Edge[]>(() => {
    if (!trackNodeIds) return layoutEdges;

    return layoutEdges.map((edge) => {
      const onTrack = trackNodeIds.has(edge.source) && trackNodeIds.has(edge.target);
      if (onTrack) {
        return {
          ...edge,
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2.5 },
        };
      }
      return {
        ...edge,
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 1.5, opacity: 0.2 },
      };
    });
  }, [layoutEdges, trackNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(enrichedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(enrichedEdges);

  useEffect(() => {
    setNodes(enrichedNodes);
  }, [enrichedNodes, setNodes]);

  useEffect(() => {
    setEdges(enrichedEdges);
  }, [enrichedEdges, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3}
      maxZoom={2}
    >
      <Background />
      <Controls />

    </ReactFlow>
  );
}
