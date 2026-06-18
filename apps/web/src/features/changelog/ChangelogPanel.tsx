import { useState, useEffect, useCallback } from 'react';
import { History, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { ChangelogEntry, PaginatedChangelog } from '@skillatlas/shared';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function ActionIcon({ action }: { action: ChangelogEntry['action'] }) {
  if (action === 'add') {
    return <Plus size={14} style={{ color: '#16a34a', flexShrink: 0 }} />;
  }
  if (action === 'edit') {
    return <Pencil size={14} style={{ color: '#2563eb', flexShrink: 0 }} />;
  }
  return <Trash2 size={14} style={{ color: '#dc2626', flexShrink: 0 }} />;
}

function entityTypeLabel(type: string): string {
  const map: Record<string, string> = {
    Profession: 'Профессия',
    Skill: 'Навык',
    Resource: 'Ресурс',
    Tag: 'Тег',
  };
  return map[type] ?? type;
}

export function ChangelogPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get<PaginatedChangelog>('/changelog?pageSize=20')
      .then((data) => setEntries(data.items))
      .catch(() => setError('Не удалось загрузить историю'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="История изменений"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
      >
        <History size={20} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 51,
            background: 'rgba(0,0,0,0.35)',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 52,
          width: '360px',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          boxShadow: open ? '-4px 0 24px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, fontSize: '15px' }}>История изменений</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '32px' }}>
              Загрузка...
            </p>
          )}
          {error && (
            <p style={{ color: '#dc2626', textAlign: 'center', marginTop: '32px' }}>
              {error}
            </p>
          )}
          {!loading && !error && entries.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '32px' }}>
              Изменений пока нет
            </p>
          )}
          {!loading && !error && entries.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ marginTop: '2px' }}>
                    <ActionIcon action={entry.action} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={entry.entityTitle}
                    >
                      {entry.entityTitle}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {entityTypeLabel(entry.entityType)} · {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
