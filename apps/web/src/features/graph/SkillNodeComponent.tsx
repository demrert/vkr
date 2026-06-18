import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Link } from 'react-router-dom';
import type { SkillLevel } from '@skillatlas/shared';
import { useProgressStore } from '@/store/progress';

export interface SkillNodeData {
  id: string;
  label: string;
  slug: string;
  level: SkillLevel;
  category: string;
  importance: number;
  dimmed?: boolean;
  isTarget?: boolean;
  onNodeClick?: (id: string) => void;
  tierColor?: string;
  tierLabel?: string;
}

const levelColors: Record<SkillLevel, string> = {
  Junior: '#22c55e',
  Middle: '#3b82f6',
  Senior: '#f59e0b',
  Expert: '#ef4444',
};

const progressColors: Record<string, { border: string; bg: string }> = {
  done: { border: '#16a34a', bg: '#16a34a20' },
  doing: { border: '#2563eb', bg: '#2563eb20' },
  planned: { border: '#d97706', bg: '#d9770620' },
};

export const SkillNodeComponent = memo(function SkillNode({ data, selected }: NodeProps) {
  const d = data as unknown as SkillNodeData;
  const progressStatus = useProgressStore((s) => s.entries[d.id] ?? null);
  const levelColor = levelColors[d.level];

  let borderColor: string;
  let bgColor: string;

  if (d.tierColor) {
    borderColor = d.tierColor;
    bgColor = d.tierColor + '33';
  } else if (progressStatus && progressColors[progressStatus]) {
    const pc = progressColors[progressStatus]!;
    borderColor = selected ? pc.border : pc.border + 'cc';
    bgColor = pc.bg;
  } else {
    borderColor = selected ? levelColor : levelColor + '80';
    bgColor = levelColor + '15';
  }

  if (d.isTarget) {
    borderColor = '#6366f1';
    bgColor = '#6366f120';
  }

  const containerStyle: React.CSSProperties = {
    display: 'block',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `2px solid ${borderColor}`,
    background: bgColor,
    minWidth: '120px',
    maxWidth: '180px',
    cursor: 'pointer',
    textDecoration: 'none',
    opacity: d.dimmed ? 0.35 : 1,
    outline: d.isTarget ? '2px solid #6366f1' : undefined,
    outlineOffset: d.isTarget ? '2px' : undefined,
    transition: 'opacity 0.2s',
  };

  const levelLabel = d.isTarget ? `🎯 ${d.level}` : d.level;

  const content = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          marginBottom: '2px',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: d.tierColor ?? levelColor,
            margin: 0,
          }}
        >
          {levelLabel}
        </p>
        {d.tierLabel && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#fff',
              background: d.tierColor ?? '#6b7280',
              borderRadius: '4px',
              padding: '1px 5px',
              lineHeight: '16px',
            }}
          >
            {d.tierLabel}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {d.label}
      </p>
    </>
  );

  return (
    <>
      <Handle type="target" position={Position.Left} />
      {d.onNodeClick ? (
        <div
          style={containerStyle}
          onClick={() => d.onNodeClick!(d.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') d.onNodeClick!(d.id);
          }}
        >
          {content}
        </div>
      ) : (
        <Link to={`/skill/${d.slug}`} style={containerStyle}>
          {content}
        </Link>
      )}
      <Handle type="source" position={Position.Right} />
    </>
  );
});
