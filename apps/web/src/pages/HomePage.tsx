import { Link } from 'react-router-dom';
import { ArrowRight, Map, TrendingUp, Users } from 'lucide-react';

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          Интерактивный справочник{' '}
          <span style={{ color: 'var(--accent)' }}>ИТ-специалиста</span>
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
          Визуальная карта навыков от Junior до Expert. Отмечай прогресс, сравнивай профессии,
          находи ресурсы для обучения.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
          style={{ background: 'var(--accent)' }}
        >
          Смотреть профессии <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[
          {
            icon: <Map size={24} style={{ color: 'var(--accent)' }} />,
            title: 'Граф навыков',
            desc: 'Интерактивная карта зависимостей между навыками с уровнями Junior → Expert.',
          },
          {
            icon: <TrendingUp size={24} style={{ color: 'var(--accent)' }} />,
            title: 'Трек обучения',
            desc: 'Автоматический путь от текущего уровня до целевого навыка.',
          },
          {
            icon: <Users size={24} style={{ color: 'var(--accent)' }} />,
            title: 'Сравнение профессий',
            desc: 'Найди общие и уникальные навыки между любыми двумя специальностями.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="p-6 rounded-xl border"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
          >
            <div className="mb-3">{card.icon}</div>
            <h3 className="font-semibold mb-2">{card.title}</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
