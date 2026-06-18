import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

export interface LevelZoneData {
  label: string;
  color: string;
}

export const LevelZoneNode = memo(function LevelZone({ data }: NodeProps) {
  const d = data as unknown as LevelZoneData;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        border: `2px solid ${d.color}30`,
        background: `${d.color}08`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '10px 14px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: d.color,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          opacity: 0.7,
        }}
      >
        {d.label}
      </span>
    </div>
  );
});
