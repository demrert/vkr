import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { AuthResponse } from '@skillatlas/shared';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<AuthResponse>('/auth/login', { email, password });
      setAuth(data.token, data.user);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Вход</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border outline-none focus:border-indigo-400"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border outline-none focus:border-indigo-400"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg text-white font-medium"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }} className="hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
