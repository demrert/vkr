import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { PaginatedProfessions } from '@skillatlas/shared';

export function CatalogPage() {
  const [data, setData] = useState<PaginatedProfessions | null>(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: '1', pageSize: '20' });
    if (q) params.set('q', q);
    api
      .get<PaginatedProfessions>(`/professions?${params}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Каталог профессий</h1>

      <div
        className="flex items-center gap-2 border rounded-lg px-3 mb-6"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
      >
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Найти профессию..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 py-2 bg-transparent outline-none text-sm"
          style={{ color: 'var(--text)' }}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Загрузка...</p>
      ) : (
        <div className="grid gap-4">
          {data?.items.map((p) => (
            <Link
              key={p.id}
              to={`/profession/${p.slug}`}
              className="block p-5 rounded-xl border hover:border-indigo-400 transition-colors"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{p.title}</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {p.summary}
                  </p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  {p.salaryMedian && (
                    <p className="font-medium" style={{ color: 'var(--accent)' }}>
                      {p.salaryMedian.toLocaleString('ru')} ₽/мес
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {p.skillCount} навыков
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {data?.items.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>Ничего не найдено</p>
          )}
        </div>
      )}
    </div>
  );
}
