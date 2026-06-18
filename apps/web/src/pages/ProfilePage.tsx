import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export function ProfilePage() {
  const { user, clearAuth } = useAuthStore();
  const entries = useProgressStore((s) => s.entries);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const done = Object.values(entries).filter((s) => s === 'done').length;
  const doing = Object.values(entries).filter((s) => s === 'doing').length;
  const planned = Object.values(entries).filter((s) => s === 'planned').length;

  const stats = { done, doing, planned };

  const chartData = [
    { name: 'Изучено', value: stats.done, fill: '#22c55e' },
    { name: 'Учу', value: stats.doing, fill: '#3b82f6' },
    { name: 'Запланировано', value: stats.planned, fill: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const RADIAN = Math.PI / 180;
  const renderLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, value,
  }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; value: number }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700}>
        {value}
      </text>
    );
  };

  const hasProgress = done + doing + planned > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>

      <div
        className="p-5 rounded-xl border mb-6"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
      >
        <p className="font-medium">{user.name ?? user.email}</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {user.email}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Роль: {user.role}
        </p>
      </div>

      <div>
        <h2 className="font-semibold mb-4">Прогресс</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Изучено', value: stats.done, color: '#22c55e' },
            { label: 'Учу', value: stats.doing, color: '#3b82f6' },
            { label: 'Запланировано', value: stats.planned, color: '#f59e0b' },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-xl border text-center"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              <p className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {hasProgress && (
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  labelLine={false}
                  label={renderLabel}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} навыков`, '']}
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ display: 'none' }}
                />
                <Legend
                  formatter={(value: string) => {
                    const item = chartData.find((d) => d.name === value);
                    return `${value}: ${item?.value ?? 0}`;
                  }}
                  iconType="circle"
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <button
        onClick={() => { clearAuth(); navigate('/'); }}
        className="mt-6 text-sm hover:underline"
        style={{ color: 'var(--text-muted)' }}
      >
        Выйти
      </button>
    </div>
  );
}
