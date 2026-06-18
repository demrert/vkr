import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import type { ProfessionDetail, SkillNode } from '@skillatlas/shared';
import { SkillGraph } from '@/features/graph/SkillGraph';
import { useWindowWidth } from '@/lib/useWindowWidth';
import { useProgressStore } from '@/store/progress';
import { buildTrack } from '@/features/track/trackGenerator';

const LEVELS = ['Junior', 'Middle', 'Senior', 'Expert'] as const;

function levelColor(level: string) {
  const map: Record<string, string> = {
    Junior: '#22c55e',
    Middle: '#3b82f6',
    Senior: '#f59e0b',
    Expert: '#ef4444',
  };
  return map[level] ?? '#6366f1';
}

function MobileSkillList({ skills }: { skills: SkillNode[] }) {
  return (
    <div className="space-y-6">
      {LEVELS.map((level) => {
        const group = skills.filter((s) => s.level === level);
        if (group.length === 0) return null;
        return (
          <div key={level}>
            <h3
              className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: levelColor(level) }}
            >
              {level}
            </h3>
            <div className="space-y-2">
              {group.map((skill) => (
                <Link
                  key={skill.id}
                  to={`/skill/${skill.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-indigo-400 transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
                >
                  <div>
                    <span className="font-medium">{skill.title}</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {skill.tags.map((t) => (
                        <span
                          key={t.id}
                          className="text-xs px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: t.color }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full ml-2 shrink-0"
                    style={{
                      background: levelColor(skill.level) + '20',
                      color: levelColor(skill.level),
                    }}
                  >
                    {skill.level}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type GraphMode = 'none' | 'track' | 'demand';

export function ProfessionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profession, setProfession] = useState<ProfessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('Все');
  const [tagFilter, setTagFilter] = useState<string>('');
  const width = useWindowWidth();
  const isMobile = width < 768;

  const [graphMode, setGraphMode] = useState<GraphMode>('none');
  const [trackNodeIds, setTrackNodeIds] = useState<Set<string>>(new Set());
  const [targetSkillId, setTargetSkillId] = useState<string | undefined>(undefined);
  const [trackOrderedIds, setTrackOrderedIds] = useState<string[]>([]);

  const progressEntries = useProgressStore((s) => s.entries);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get<ProfessionDetail>(`/professions/${slug}`)
      .then(setProfession)
      .catch(() => setError('Профессия не найдена'))
      .finally(() => setLoading(false));
  }, [slug]);

  const demandTiersMap = useMemo<Record<string, string> | undefined>(() => {
    if (!profession || graphMode !== 'demand') return undefined;
    const result: Record<string, string> = {};
    for (const skill of profession.skills) {
      result[skill.id] = skill.demandTier;
    }
    return result;
  }, [profession, graphMode]);

  const toggleTrackMode = useCallback(() => {
    if (graphMode === 'track') {
      setGraphMode('none');
      setTrackNodeIds(new Set());
      setTargetSkillId(undefined);
      setTrackOrderedIds([]);
    } else {
      setGraphMode('track');
      setTrackNodeIds(new Set());
      setTargetSkillId(undefined);
      setTrackOrderedIds([]);
    }
  }, [graphMode]);

  const toggleDemandMode = useCallback(() => {
    if (graphMode === 'demand') {
      setGraphMode('none');
    } else {
      setGraphMode('demand');
      setTrackNodeIds(new Set());
      setTargetSkillId(undefined);
      setTrackOrderedIds([]);
    }
  }, [graphMode]);

  const handleSkillClick = useCallback(
    (skillId: string) => {
      if (graphMode !== 'track' || !profession) return;

      const doneSet = new Set(
        Object.entries(progressEntries)
          .filter(([, status]) => status === 'done')
          .map(([id]) => id)
      );

      const ordered = buildTrack(skillId, profession.skills, doneSet);
      setTrackOrderedIds(ordered);
      setTrackNodeIds(new Set(ordered));
      setTargetSkillId(skillId);
    },
    [graphMode, profession, progressEntries]
  );

  if (loading)
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        Загрузка...
      </div>
    );
  if (error || !profession)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  const allTags = Array.from(
    new Map(
      profession.skills.flatMap((s) => s.tags).map((t) => [t.id, t])
    ).values()
  );

  const filteredSkills = profession.skills.filter((skill) => {
    const levelOk = levelFilter === 'Все' || skill.level === levelFilter;
    const tagOk = !tagFilter || skill.tags.some((t) => t.id === tagFilter);
    return levelOk && tagOk;
  });

  const skillById = new Map(profession.skills.map((s) => [s.id, s]));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/catalog" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
          ← Все профессии
        </Link>
        <h1 className="text-3xl font-bold mt-2">{profession.title}</h1>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
          {profession.summary}
        </p>
        {profession.salaryMedian && (
          <p className="mt-2 text-lg font-medium" style={{ color: 'var(--accent)' }}>
            Медианная зарплата: {profession.salaryMedian.toLocaleString('ru')} ₽/мес
          </p>
        )}
      </div>

      {isMobile ? (
        <div className="mb-8">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Навыки по уровням
          </p>
          <MobileSkillList skills={profession.skills} />
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={toggleTrackMode}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: `2px solid ${graphMode === 'track' ? '#6366f1' : 'var(--border)'}`,
                background: graphMode === 'track' ? '#6366f115' : 'var(--bg-secondary)',
                color: graphMode === 'track' ? '#6366f1' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              🎯 Трек
            </button>
            <button
              onClick={toggleDemandMode}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: `2px solid ${graphMode === 'demand' ? '#dc2626' : 'var(--border)'}`,
                background: graphMode === 'demand' ? '#dc262615' : 'var(--bg-secondary)',
                color: graphMode === 'demand' ? '#dc2626' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              📊 Спрос
            </button>
            {graphMode === 'track' && !targetSkillId && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Кликните на навык, чтобы построить трек
              </span>
            )}
            {graphMode === 'track' && targetSkillId && (
              <span style={{ fontSize: '12px', color: '#6366f1' }}>
                Трек до «{skillById.get(targetSkillId)?.title ?? targetSkillId}» · {trackOrderedIds.length} шаг(ов)
              </span>
            )}
          </div>

          <div
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: 'var(--border)',
              height: '600px',
              cursor: graphMode === 'track' ? 'crosshair' : 'default',
            }}
          >
            <SkillGraph
              skills={profession.skills}
              trackNodeIds={graphMode === 'track' && trackNodeIds.size > 0 ? trackNodeIds : undefined}
              targetSkillId={graphMode === 'track' ? targetSkillId : undefined}
              demandTiers={demandTiersMap}
              onSkillClick={graphMode === 'track' ? handleSkillClick : undefined}
            />
          </div>

          {graphMode === 'track' && trackOrderedIds.length > 0 && (
            <div
              className="mt-4 rounded-xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Порядок изучения ({trackOrderedIds.length} шагов)
              </div>
              <ol style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                {trackOrderedIds.map((id, idx) => {
                  const skill = skillById.get(id);
                  if (!skill) return null;
                  const isDone = progressEntries[id] === 'done';
                  return (
                    <li
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 16px',
                        borderBottom:
                          idx < trackOrderedIds.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          minWidth: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: id === targetSkillId ? '#6366f1' : 'var(--bg)',
                          border: `2px solid ${id === targetSkillId ? '#6366f1' : 'var(--border)'}`,
                          color: id === targetSkillId ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                          {id === targetSkillId && '🎯 '}
                          {skill.title}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: levelColor(skill.level) + '20',
                          color: levelColor(skill.level),
                          flexShrink: 0,
                        }}
                      >
                        {skill.level}
                      </span>
                      {isDone && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: '#16a34a20',
                            color: '#16a34a',
                            flexShrink: 0,
                          }}
                        >
                          изучено
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-1 flex-wrap">
            {(['Все', ...LEVELS] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
                style={
                  levelFilter === l
                    ? {
                        background: l === 'Все' ? 'var(--accent)' : levelColor(l),
                        color: '#fff',
                        border: '2px solid transparent',
                      }
                    : {
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                        border: '2px solid var(--border)',
                      }
                }
              >
                {l}
              </button>
            ))}
          </div>

          {allTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="text-sm rounded-lg px-3 py-1.5 border"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
            >
              <option value="">Все теги</option>
              {allTags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4">
          Навыки ({filteredSkills.length}
          {filteredSkills.length !== profession.skills.length && ` из ${profession.skills.length}`})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSkills.map((skill) => (
            <Link
              key={skill.id}
              to={`/skill/${skill.slug}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:border-indigo-400 transition-colors"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              <div>
                <span className="font-medium">{skill.title}</span>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {skill.tags.map((t) => (
                    <span
                      key={t.id}
                      className="text-xs px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: t.color }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full ml-2 shrink-0"
                style={{
                  background: levelColor(skill.level) + '20',
                  color: levelColor(skill.level),
                }}
              >
                {skill.level}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
