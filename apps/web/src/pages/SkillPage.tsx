import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';
import type { SkillDetail } from '@skillatlas/shared';
import type { ProgressStatus } from '@skillatlas/shared';

interface ProgressButtonProps {
  skillId: string;
}

const PROGRESS_OPTIONS: { status: ProgressStatus | null; label: string }[] = [
  { status: 'doing', label: 'Изучаю' },
  { status: 'done', label: 'Изучил' },
  { status: 'planned', label: 'Планирую' },
  { status: null, label: 'Убрать' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  doing: { bg: '#3b82f6', text: '#fff' },
  done: { bg: '#22c55e', text: '#fff' },
  planned: { bg: '#f59e0b', text: '#fff' },
};

function ProgressButtons({ skillId }: ProgressButtonProps) {
  const current = useProgressStore((s) => s.entries[skillId] ?? null);
  const setEntry = useProgressStore((s) => s.setEntry);
  const [busy, setBusy] = useState(false);

  async function handleClick(status: ProgressStatus | null) {
    if (busy) return;
    setBusy(true);
    try {
      await api.put(`/progress/${skillId}`, { status });
      setEntry(skillId, status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2 flex-wrap mt-4">
      {PROGRESS_OPTIONS.map(({ status, label }) => {
        const isActive = current === status;
        const styles = status ? STATUS_STYLES[status] : null;
        return (
          <button
            key={label}
            disabled={busy}
            onClick={() => { void handleClick(status); }}
            style={
              isActive && styles
                ? { background: styles.bg, color: styles.text, border: `2px solid ${styles.bg}` }
                : { background: 'var(--bg-secondary)', color: 'var(--text)', border: '2px solid var(--border)' }
            }
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {label}
          </button>
        );
      })}
      {current && (
        <span
          className="px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '2px solid var(--border)' }}
        >
          Статус: {current}
        </span>
      )}
    </div>
  );
}

export function SkillPage() {
  const { slug } = useParams<{ slug: string }>();
  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<SkillDetail>(`/skills/${slug}`).then(setSkill).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Загрузка...</div>;
  if (!skill) return <div className="p-8 text-center text-red-500">Навык не найден</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{skill.title}</h1>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span
            className="text-sm px-2 py-1 rounded-full"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {skill.level}
          </span>
          {skill.tags.map((t) => (
            <span
              key={t.id}
              className="text-sm px-2 py-1 rounded-full text-white"
              style={{ background: t.color }}
            >
              {t.name}
            </span>
          ))}
        </div>
        <p className="mt-4" style={{ color: 'var(--text-muted)' }}>
          {skill.description}
        </p>

        {user && <ProgressButtons skillId={skill.id} />}
      </div>

      {skill.prerequisites.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Необходимые навыки</h2>
          <div className="flex gap-2 flex-wrap">
            {skill.prerequisites.map((p) => (
              <Link
                key={p.id}
                to={`/skill/${p.slug}`}
                className="text-sm px-3 py-1 rounded-lg border hover:border-indigo-400"
                style={{ borderColor: 'var(--border)' }}
              >
                {p.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {skill.resources.length > 0 && (
        <section>
          <h2 className="font-semibold mb-3">Учебные ресурсы</h2>
          <div className="space-y-2">
            {skill.resources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between p-3 rounded-lg border hover:border-indigo-400 transition-colors"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
              >
                <div>
                  <p className="font-medium">{r.title}</p>
                  {r.description && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {r.description}
                    </p>
                  )}
                  <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {r.type} · {r.language}
                  </span>
                </div>
                <ExternalLink size={16} className="shrink-0 ml-2 mt-1" style={{ color: 'var(--text-muted)' }} />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
