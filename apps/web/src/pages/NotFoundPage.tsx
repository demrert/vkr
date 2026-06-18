import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-bold" style={{ color: 'var(--accent)' }}>404</p>
      <p className="mt-2 text-lg">Страница не найдена</p>
      <Link to="/" className="mt-4 inline-block text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
        На главную
      </Link>
    </div>
  );
}
