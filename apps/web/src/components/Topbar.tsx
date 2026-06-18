import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, User, LogOut, Search, ShieldCheck } from 'lucide-react';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';

export function Topbar() {
  const { dark, toggle } = useThemeStore();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <header
      className="border-b px-4 h-14 flex items-center gap-4"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
    >
      <Link to="/" className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
        SkillAtlas
      </Link>

      <nav className="flex gap-4 ml-4 text-sm">
        <Link to="/catalog" className="hover:underline" style={{ color: 'var(--text-muted)' }}>
          Профессии
        </Link>
        <Link to="/compare" className="hover:underline" style={{ color: 'var(--text-muted)' }}>
          Сравнить
        </Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="hover:underline" style={{ color: 'var(--accent)' }}>
            Админка
          </Link>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/catalog"
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
          title="Поиск"
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
        </Link>

        <button
          onClick={toggle}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
          title={dark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {dark ? (
            <Sun size={18} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <Moon size={18} style={{ color: 'var(--text-muted)' }} />
          )}
        </button>

        {user ? (
          <>
            {user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                title="Панель администратора"
              >
                <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
              </Link>
            )}
            <Link to="/profile" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
              <User size={18} style={{ color: 'var(--text-muted)' }} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <LogOut size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 rounded-md text-sm font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}
