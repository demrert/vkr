import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProfessionPage } from '@/pages/ProfessionPage';
import { SkillPage } from '@/pages/SkillPage';
import { ComparePage } from '@/pages/ComparePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AdminPage } from '@/pages/AdminPage';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';
import { api } from '@/lib/api';
import type { UserProgress } from '@skillatlas/shared';

function ProgressLoader() {
  const token = useAuthStore((s) => s.token);
  const setEntries = useProgressStore((s) => s.setEntries);

  useEffect(() => {
    if (!token) return;
    api
      .get<UserProgress>('/progress')
      .then((p) => {
        const map = Object.fromEntries(p.entries.map((e) => [e.skillId, e.status]));
        setEntries(map);
      })
      .catch(() => {});
  }, [token, setEntries]);

  return null;
}

export default function App() {
  return (
    <>
      <ProgressLoader />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="profession/:slug" element={<ProfessionPage />} />
          <Route path="skill/:slug" element={<SkillPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
