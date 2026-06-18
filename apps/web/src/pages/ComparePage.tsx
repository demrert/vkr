import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PaginatedProfessions, ProfessionCompare } from '@skillatlas/shared';

export function ComparePage() {
  const [professions, setProfessions] = useState<PaginatedProfessions['items']>([]);
  const [slugA, setSlugA] = useState('');
  const [slugB, setSlugB] = useState('');
  const [result, setResult] = useState<ProfessionCompare | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<PaginatedProfessions>('/professions?pageSize=50').then((d) => setProfessions(d.items));
  }, []);

  async function handleCompare() {
    if (!slugA || !slugB) return;
    setLoading(true);
    try {
      const data = await api.get<ProfessionCompare>(`/professions/compare?a=${slugA}&b=${slugB}`);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  const commonSet = new Set(result?.commonSkillIds ?? []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Сравнение профессий</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={slugA}
          onChange={(e) => setSlugA(e.target.value)}
          className="px-3 py-2 rounded-lg border outline-none"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }}
        >
          <option value="">Выбери первую</option>
          {professions.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>

        <select
          value={slugB}
          onChange={(e) => setSlugB(e.target.value)}
          className="px-3 py-2 rounded-lg border outline-none"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }}
        >
          <option value="">Выбери вторую</option>
          {professions.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleCompare}
          disabled={!slugA || !slugB || loading}
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Сравниваем...' : 'Сравнить'}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[result.a, result.b].map((prof) => (
            <div
              key={prof.id}
              className="p-5 rounded-xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              <h2 className="font-semibold text-lg mb-3">{prof.title}</h2>
              <ul className="space-y-1">
                {prof.skills.map((s) => (
                  <li
                    key={s.id}
                    className="text-sm flex items-center gap-2"
                    style={{
                      color: commonSet.has(s.id) ? 'var(--accent)' : 'var(--text)',
                      fontWeight: commonSet.has(s.id) ? 600 : 400,
                    }}
                  >
                    {commonSet.has(s.id) && '★'} {s.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {result && (
        <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          Общих навыков: {result.commonSkillIds.length} (выделены ★)
        </p>
      )}
    </div>
  );
}
