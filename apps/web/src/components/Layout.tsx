import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { ChangelogPanel } from '@/features/changelog/ChangelogPanel';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Topbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ChangelogPanel />
    </div>
  );
}
