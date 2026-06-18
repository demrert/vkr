import { PrismaClient, SkillLevel, ResourceType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('admin1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillatlas.ru' },
    update: {},
    create: { email: 'admin@skillatlas.ru', passwordHash: adminHash, name: 'Admin', role: 'ADMIN' },
  });
  console.log('Admin:', admin.email);

  const tagDefs = [
    { name: 'backend',    color: '#3b82f6' },
    { name: 'frontend',   color: '#f59e0b' },
    { name: 'devops',     color: '#10b981' },
    { name: 'database',   color: '#8b5cf6' },
    { name: 'security',   color: '#ef4444' },
    { name: 'algorithms', color: '#6366f1' },
    { name: 'testing',    color: '#ec4899' },
    { name: 'mobile',     color: '#f97316' },
    { name: 'ml',         color: '#a855f7' },
    { name: 'data',       color: '#06b6d4' },
  ];
  const tags = Object.fromEntries(
    await Promise.all(
      tagDefs.map((t) =>
        prisma.tag.upsert({ where: { name: t.name }, update: {}, create: t }).then((r) => [t.name, r])
      )
    )
  );
  console.log('Tags:', Object.keys(tags).length);

  type SkillDef = {
    slug: string; title: string; description: string;
    level: SkillLevel; category: string; tags: string[];
  };

  const skillDefs: SkillDef[] = [
    {
      slug: 'programming-basics',
      title: 'Основы программирования',
      description: 'Переменные, типы данных, условия, циклы, функции. Базовая алгоритмика и структуры данных: массивы, словари, стеки.',
      level: SkillLevel.Junior, category: 'core', tags: ['algorithms'],
    },
    {
      slug: 'git-basics',
      title: 'Git и контроль версий',
      description: 'Базовые команды Git: init, clone, commit, push, pull. Ветвление и слияние, разрешение конфликтов, pull request.',
      level: SkillLevel.Junior, category: 'tools', tags: ['backend', 'frontend'],
    },
    {
      slug: 'http-rest',
      title: 'HTTP и REST',
      description: 'Протокол HTTP: методы, заголовки, статусы, куки. Принципы REST API, идемпотентность, версионирование.',
      level: SkillLevel.Junior, category: 'core', tags: ['backend'],
    },
    {
      slug: 'sql-basics',
      title: 'SQL (основы)',
      description: 'SELECT, INSERT, UPDATE, DELETE. JOIN, GROUP BY, агрегаты. Индексы, транзакции, нормализация.',
      level: SkillLevel.Junior, category: 'database', tags: ['database'],
    },
    {
      slug: 'docker-basics',
      title: 'Docker',
      description: 'Контейнеризация приложений. Dockerfile, docker-compose, тома и сети. Разница контейнер/образ.',
      level: SkillLevel.Middle, category: 'devops', tags: ['devops'],
    },
    {
      slug: 'testing-backend',
      title: 'Тестирование backend',
      description: 'Юнит-тесты, интеграционные тесты, Supertest. Стратегии тестирования, моки и стабы, покрытие кода.',
      level: SkillLevel.Middle, category: 'testing', tags: ['testing', 'backend'],
    },

    {
      slug: 'nodejs-express',
      title: 'Node.js + Express',
      description: 'Создание REST API на Node.js. Middleware, роутинг, обработка ошибок, валидация запросов.',
      level: SkillLevel.Middle, category: 'backend', tags: ['backend'],
    },
    {
      slug: 'postgresql',
      title: 'PostgreSQL',
      description: 'Продвинутое использование PostgreSQL: индексы (B-tree, GIN, GiST), EXPLAIN ANALYZE, партиционирование, полнотекстовый поиск.',
      level: SkillLevel.Middle, category: 'database', tags: ['database', 'backend'],
    },
    {
      slug: 'auth-jwt',
      title: 'Аутентификация (JWT)',
      description: 'JWT-токены, bcrypt, хранение сессий, refresh tokens. OAuth 2.0 — основные flow.',
      level: SkillLevel.Middle, category: 'security', tags: ['security', 'backend'],
    },
    {
      slug: 'system-design-basics',
      title: 'Основы System Design',
      description: 'Масштабирование (горизонтальное/вертикальное), кэширование, очереди сообщений. CAP-теорема, BASE vs ACID.',
      level: SkillLevel.Senior, category: 'architecture', tags: ['backend'],
    },
    {
      slug: 'microservices',
      title: 'Микросервисная архитектура',
      description: 'Разбиение монолита на сервисы, межсервисное взаимодействие (REST, gRPC). Event-driven архитектура, Saga-паттерн.',
      level: SkillLevel.Senior, category: 'architecture', tags: ['backend', 'devops'],
    },
    {
      slug: 'performance-optimization',
      title: 'Оптимизация производительности',
      description: 'Профилирование Node.js, оптимизация SQL-запросов, connection pooling, CDN. N+1 проблема.',
      level: SkillLevel.Expert, category: 'advanced', tags: ['backend', 'database'],
    },

    {
      slug: 'html-css',
      title: 'HTML и CSS',
      description: 'Семантическая разметка HTML5, CSS-селекторы, блочная модель, Flexbox, Grid. Адаптивная вёрстка.',
      level: SkillLevel.Junior, category: 'frontend', tags: ['frontend'],
    },
    {
      slug: 'javascript',
      title: 'JavaScript (основы)',
      description: 'ES6+: стрелочные функции, деструктуризация, промисы, async/await. DOM API, события, замыкания.',
      level: SkillLevel.Junior, category: 'frontend', tags: ['frontend'],
    },
    {
      slug: 'typescript-basics',
      title: 'TypeScript',
      description: 'Статическая типизация, интерфейсы, дженерики, utility-типы. Настройка tsconfig, strict mode.',
      level: SkillLevel.Middle, category: 'frontend', tags: ['frontend', 'backend'],
    },
    {
      slug: 'react-basics',
      title: 'React (основы)',
      description: 'Компоненты, JSX, хуки (useState, useEffect, useContext). Props, state, условный рендеринг, списки.',
      level: SkillLevel.Middle, category: 'frontend', tags: ['frontend'],
    },
    {
      slug: 'bundlers',
      title: 'Сборщики (Webpack/Vite)',
      description: 'Конфигурация Vite и Webpack: лоадеры, плагины, code splitting, tree shaking, dev server.',
      level: SkillLevel.Middle, category: 'tools', tags: ['frontend'],
    },
    {
      slug: 'testing-frontend',
      title: 'Тестирование frontend',
      description: 'Vitest, React Testing Library. Тестирование компонентов, хуков, пользовательских взаимодействий.',
      level: SkillLevel.Middle, category: 'testing', tags: ['testing', 'frontend'],
    },
    {
      slug: 'react-advanced',
      title: 'React (продвинутый)',
      description: 'useMemo, useCallback, React.memo, порталы, Suspense, Error Boundary. Паттерны компонентов.',
      level: SkillLevel.Senior, category: 'frontend', tags: ['frontend'],
    },
    {
      slug: 'performance-frontend',
      title: 'Производительность frontend',
      description: 'Core Web Vitals, Lighthouse, lazy loading, виртуализация списков, оптимизация бандла.',
      level: SkillLevel.Senior, category: 'advanced', tags: ['frontend'],
    },
    {
      slug: 'frontend-architecture',
      title: 'Архитектура frontend',
      description: 'Feature Sliced Design, Atomic Design, монорепозитории, micro-frontends, design systems.',
      level: SkillLevel.Expert, category: 'architecture', tags: ['frontend'],
    },

    {
      slug: 'linux-basics',
      title: 'Linux (основы)',
      description: 'Командная строка: файловая система, процессы, права доступа, cron, systemd, пакетные менеджеры.',
      level: SkillLevel.Junior, category: 'devops', tags: ['devops'],
    },
    {
      slug: 'networking-basics',
      title: 'Сети и протоколы',
      description: 'TCP/IP, DNS, HTTP/HTTPS, TLS/SSL. Базовое понимание маршрутизации, NAT, firewall.',
      level: SkillLevel.Junior, category: 'devops', tags: ['devops', 'security'],
    },
    {
      slug: 'ci-cd',
      title: 'CI/CD',
      description: 'Настройка пайплайнов в GitHub Actions, GitLab CI. Автотесты, сборка образов, деплой.',
      level: SkillLevel.Middle, category: 'devops', tags: ['devops'],
    },
    {
      slug: 'kubernetes',
      title: 'Kubernetes',
      description: 'Pod, Deployment, Service, Ingress, ConfigMap, Secret. kubectl, Helm, базовое управление кластером.',
      level: SkillLevel.Senior, category: 'devops', tags: ['devops'],
    },
    {
      slug: 'terraform',
      title: 'Terraform / IaC',
      description: 'Infrastructure as Code: провайдеры, ресурсы, модули, state. Управление инфрой в Yandex Cloud / AWS.',
      level: SkillLevel.Senior, category: 'devops', tags: ['devops'],
    },
    {
      slug: 'monitoring',
      title: 'Мониторинг и логирование',
      description: 'Prometheus, Grafana, Loki. Метрики, алерты, структурированное логирование, трейсинг (Jaeger).',
      level: SkillLevel.Senior, category: 'devops', tags: ['devops'],
    },
    {
      slug: 'platform-engineering',
      title: 'Platform Engineering',
      description: 'SRE-практики, SLO/SLI/SLA, chaos engineering, GitOps (ArgoCD), внутренние платформы для разработчиков.',
      level: SkillLevel.Expert, category: 'architecture', tags: ['devops'],
    },

    {
      slug: 'python-basics',
      title: 'Python (основы)',
      description: 'Синтаксис Python: коллекции, функции, ООП, работа с файлами. pip, виртуальные окружения.',
      level: SkillLevel.Junior, category: 'core', tags: ['backend', 'ml'],
    },
    {
      slug: 'math-stats',
      title: 'Математика и статистика',
      description: 'Линейная алгебра, мат. статистика, теория вероятностей. Распределения, проверка гипотез, корреляция.',
      level: SkillLevel.Junior, category: 'core', tags: ['ml', 'data'],
    },
    {
      slug: 'pandas-numpy',
      title: 'Pandas и NumPy',
      description: 'Обработка и анализ табличных данных. DataFrame, операции над массивами, обработка пропусков.',
      level: SkillLevel.Middle, category: 'data', tags: ['data', 'ml'],
    },
    {
      slug: 'data-viz',
      title: 'Визуализация данных',
      description: 'Matplotlib, Seaborn, Plotly. Выбор типа графика, построение дашбордов, EDA.',
      level: SkillLevel.Middle, category: 'data', tags: ['data'],
    },
    {
      slug: 'ml-basics',
      title: 'Машинное обучение (основы)',
      description: 'Scikit-learn: регрессия, классификация, кластеризация. Кросс-валидация, метрики качества.',
      level: SkillLevel.Middle, category: 'ml', tags: ['ml'],
    },
    {
      slug: 'deep-learning',
      title: 'Глубокое обучение',
      description: 'PyTorch / TensorFlow: нейронные сети, CNN, RNN, трансформеры. Обучение и тонкая настройка моделей.',
      level: SkillLevel.Senior, category: 'ml', tags: ['ml'],
    },
    {
      slug: 'mlops',
      title: 'MLOps',
      description: 'Версионирование данных и моделей (DVC, MLflow), пайплайны обучения, деплой моделей в продакшн.',
      level: SkillLevel.Senior, category: 'devops', tags: ['ml', 'devops'],
    },
    {
      slug: 'research-ml',
      title: 'ML Research & SOTA',
      description: 'Чтение и воспроизведение статей, участие в Kaggle, разработка новых архитектур и методов обучения.',
      level: SkillLevel.Expert, category: 'advanced', tags: ['ml'],
    },

    {
      slug: 'mobile-basics',
      title: 'Основы мобильной разработки',
      description: 'Жизненный цикл мобильного приложения, нотификации, работа с камерой и геолокацией, App Store / Google Play.',
      level: SkillLevel.Junior, category: 'mobile', tags: ['mobile'],
    },
    {
      slug: 'react-native',
      title: 'React Native',
      description: 'Компоненты RN (View, Text, FlatList), StyleSheet, навигация (React Navigation), работа с Native API.',
      level: SkillLevel.Middle, category: 'mobile', tags: ['mobile', 'frontend'],
    },
    {
      slug: 'mobile-state',
      title: 'Управление состоянием (mobile)',
      description: 'Zustand / Redux Toolkit в мобильном контексте, асинхронное хранилище (MMKV, AsyncStorage).',
      level: SkillLevel.Middle, category: 'mobile', tags: ['mobile'],
    },
    {
      slug: 'mobile-performance',
      title: 'Производительность мобильных приложений',
      description: 'Профилирование через Flipper, оптимизация FlatList, Hermes engine, reduce re-renders.',
      level: SkillLevel.Senior, category: 'advanced', tags: ['mobile'],
    },
    {
      slug: 'native-modules',
      title: 'Native Modules (iOS/Android)',
      description: 'Написание нативных модулей на Swift/Kotlin, New Architecture (JSI, Fabric, TurboModules).',
      level: SkillLevel.Senior, category: 'mobile', tags: ['mobile'],
    },
    {
      slug: 'mobile-architecture',
      title: 'Архитектура мобильных приложений',
      description: 'MVC, MVP, MVVM, Clean Architecture в мобильном контексте. Монорепо для iOS + Android + Web.',
      level: SkillLevel.Expert, category: 'architecture', tags: ['mobile'],
    },

    {
      slug: 'testing-basics',
      title: 'Основы тестирования',
      description: 'Виды тестов: юнит, интеграционные, E2E, регрессионные, нагрузочные. Тест-план, тест-кейс, баг-репорт.',
      level: SkillLevel.Junior, category: 'testing', tags: ['testing'],
    },
    {
      slug: 'test-documentation',
      title: 'Тест-документация',
      description: 'Написание чек-листов, тест-кейсов, тест-планов. Работа с Jira, TestRail, Qase.',
      level: SkillLevel.Junior, category: 'testing', tags: ['testing'],
    },
    {
      slug: 'api-testing',
      title: 'API-тестирование',
      description: 'Postman, Newman. Тестирование REST API: валидация ответов, цепочки запросов, переменные окружения.',
      level: SkillLevel.Middle, category: 'testing', tags: ['testing', 'backend'],
    },
    {
      slug: 'automation-testing',
      title: 'Автоматизация тестирования',
      description: 'Playwright / Selenium: написание E2E-тестов, Page Object Model, параллельный запуск, отчёты.',
      level: SkillLevel.Middle, category: 'testing', tags: ['testing'],
    },
    {
      slug: 'performance-testing',
      title: 'Нагрузочное тестирование',
      description: 'k6, JMeter, Gatling. Сценарии нагрузки, анализ метрик, поиск узких мест.',
      level: SkillLevel.Senior, category: 'testing', tags: ['testing', 'devops'],
    },
    {
      slug: 'security-testing',
      title: 'Тестирование безопасности',
      description: 'OWASP Top 10, пентест-инструменты (Burp Suite), поиск XSS/SQL-инъекций, анализ уязвимостей.',
      level: SkillLevel.Senior, category: 'security', tags: ['security', 'testing'],
    },
    {
      slug: 'qa-architecture',
      title: 'Архитектура QA-процессов',
      description: 'Построение QA-стратегии в команде, shift-left testing, TDD/BDD (Cucumber), метрики качества релизов.',
      level: SkillLevel.Expert, category: 'architecture', tags: ['testing'],
    },
  ];

  const skills = Object.fromEntries(
    await Promise.all(
      skillDefs.map((s) =>
        prisma.skill
          .upsert({ where: { slug: s.slug }, update: {}, create: { slug: s.slug, title: s.title, description: s.description, level: s.level, category: s.category } })
          .then((r) => [s.slug, r])
      )
    )
  );
  console.log('Skills:', Object.keys(skills).length);

  await Promise.all(
    skillDefs.flatMap((s) =>
      s.tags.map((tagName) =>
        prisma.skillTag.upsert({
          where: { skillId_tagId: { skillId: skills[s.slug]!.id, tagId: tags[tagName]!.id } },
          update: {},
          create: { skillId: skills[s.slug]!.id, tagId: tags[tagName]!.id },
        })
      )
    )
  );

  const profDefs = [
    {
      slug: 'backend-developer',
      title: 'Backend-разработчик',
      summary: 'Проектирует и реализует серверную логику, API, работает с базами данных и обеспечивает надёжность приложений.',
      salaryMedian: 180000,
      metadata: { demand: 'high', remoteRate: 0.8 },
    },
    {
      slug: 'frontend-developer',
      title: 'Frontend-разработчик',
      summary: 'Создаёт пользовательские интерфейсы: от вёрстки до сложных SPA-приложений с продуманным UX.',
      salaryMedian: 165000,
      metadata: { demand: 'high', remoteRate: 0.85 },
    },
    {
      slug: 'devops-engineer',
      title: 'DevOps-инженер',
      summary: 'Выстраивает инфраструктуру, CI/CD-пайплайны, мониторинг и автоматизирует процессы разработки и доставки.',
      salaryMedian: 200000,
      metadata: { demand: 'high', remoteRate: 0.75 },
    },
    {
      slug: 'data-scientist',
      title: 'Data Scientist',
      summary: 'Разрабатывает и внедряет ML-модели, анализирует данные, превращает их в ценность для бизнеса.',
      salaryMedian: 190000,
      metadata: { demand: 'high', remoteRate: 0.7 },
    },
    {
      slug: 'mobile-developer',
      title: 'Mobile-разработчик (React Native)',
      summary: 'Создаёт кроссплатформенные мобильные приложения на React Native для iOS и Android.',
      salaryMedian: 175000,
      metadata: { demand: 'medium', remoteRate: 0.8 },
    },
    {
      slug: 'qa-engineer',
      title: 'QA-инженер',
      summary: 'Обеспечивает качество продукта: ручное и автоматизированное тестирование, выстраивает QA-процессы в команде.',
      salaryMedian: 140000,
      metadata: { demand: 'medium', remoteRate: 0.7 },
    },
  ];

  const professions = Object.fromEntries(
    await Promise.all(
      profDefs.map((p) =>
        prisma.profession
          .upsert({ where: { slug: p.slug }, update: {}, create: p })
          .then((r) => [p.slug, r])
      )
    )
  );
  console.log('Professions:', Object.keys(professions).length);

  type DemandTier = 'S' | 'A' | 'B' | 'C' | 'D';
  function importanceToTier(importance: number): DemandTier {
    if (importance >= 10) return 'S';
    if (importance >= 8) return 'A';
    if (importance >= 6) return 'B';
    if (importance >= 5) return 'C';
    return 'D';
  }

  type PSLink = { prof: string; skill: string; importance: number; demandTier: DemandTier };

  const profSkillLinks: PSLink[] = [
    { prof: 'backend-developer', skill: 'programming-basics',    importance: 10, demandTier: importanceToTier(10) },
    { prof: 'backend-developer', skill: 'git-basics',            importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'backend-developer', skill: 'http-rest',             importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'backend-developer', skill: 'sql-basics',            importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'backend-developer', skill: 'nodejs-express',        importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'backend-developer', skill: 'postgresql',            importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'backend-developer', skill: 'auth-jwt',              importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'backend-developer', skill: 'docker-basics',         importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'backend-developer', skill: 'testing-backend',       importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'backend-developer', skill: 'typescript-basics',     importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'backend-developer', skill: 'system-design-basics',  importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'backend-developer', skill: 'microservices',         importance: 5,  demandTier: importanceToTier(5)  },
    { prof: 'backend-developer', skill: 'performance-optimization', importance: 4, demandTier: importanceToTier(4) },

    { prof: 'frontend-developer', skill: 'html-css',              importance: 10, demandTier: importanceToTier(10) },
    { prof: 'frontend-developer', skill: 'javascript',            importance: 10, demandTier: importanceToTier(10) },
    { prof: 'frontend-developer', skill: 'git-basics',            importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'frontend-developer', skill: 'typescript-basics',     importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'frontend-developer', skill: 'react-basics',          importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'frontend-developer', skill: 'http-rest',             importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'frontend-developer', skill: 'bundlers',              importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'frontend-developer', skill: 'testing-frontend',      importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'frontend-developer', skill: 'react-advanced',        importance: 5,  demandTier: importanceToTier(5)  },
    { prof: 'frontend-developer', skill: 'performance-frontend',  importance: 5,  demandTier: importanceToTier(5)  },
    { prof: 'frontend-developer', skill: 'frontend-architecture', importance: 4,  demandTier: importanceToTier(4)  },

    { prof: 'devops-engineer', skill: 'linux-basics',         importance: 10, demandTier: importanceToTier(10) },
    { prof: 'devops-engineer', skill: 'networking-basics',    importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'devops-engineer', skill: 'git-basics',           importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'devops-engineer', skill: 'docker-basics',        importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'devops-engineer', skill: 'ci-cd',                importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'devops-engineer', skill: 'sql-basics',           importance: 5,  demandTier: importanceToTier(5)  },
    { prof: 'devops-engineer', skill: 'kubernetes',           importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'devops-engineer', skill: 'terraform',            importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'devops-engineer', skill: 'monitoring',           importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'devops-engineer', skill: 'security-testing',     importance: 5,  demandTier: importanceToTier(5)  },
    { prof: 'devops-engineer', skill: 'platform-engineering', importance: 4,  demandTier: importanceToTier(4)  },

    { prof: 'data-scientist', skill: 'python-basics',    importance: 10, demandTier: importanceToTier(10) },
    { prof: 'data-scientist', skill: 'math-stats',       importance: 10, demandTier: importanceToTier(10) },
    { prof: 'data-scientist', skill: 'sql-basics',       importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'data-scientist', skill: 'pandas-numpy',     importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'data-scientist', skill: 'data-viz',         importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'data-scientist', skill: 'ml-basics',        importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'data-scientist', skill: 'git-basics',       importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'data-scientist', skill: 'docker-basics',    importance: 5,  demandTier: importanceToTier(5)  },
    { prof: 'data-scientist', skill: 'deep-learning',    importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'data-scientist', skill: 'mlops',            importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'data-scientist', skill: 'research-ml',      importance: 4,  demandTier: importanceToTier(4)  },

    { prof: 'mobile-developer', skill: 'javascript',          importance: 10, demandTier: importanceToTier(10) },
    { prof: 'mobile-developer', skill: 'git-basics',          importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'mobile-developer', skill: 'mobile-basics',       importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'mobile-developer', skill: 'react-basics',        importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'mobile-developer', skill: 'react-native',        importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'mobile-developer', skill: 'typescript-basics',   importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'mobile-developer', skill: 'mobile-state',        importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'mobile-developer', skill: 'http-rest',           importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'mobile-developer', skill: 'mobile-performance',  importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'mobile-developer', skill: 'native-modules',      importance: 5,  demandTier: importanceToTier(5)  },
    { prof: 'mobile-developer', skill: 'mobile-architecture', importance: 4,  demandTier: importanceToTier(4)  },

    { prof: 'qa-engineer', skill: 'testing-basics',       importance: 10, demandTier: importanceToTier(10) },
    { prof: 'qa-engineer', skill: 'test-documentation',   importance: 9,  demandTier: importanceToTier(9)  },
    { prof: 'qa-engineer', skill: 'http-rest',            importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'qa-engineer', skill: 'api-testing',          importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'qa-engineer', skill: 'sql-basics',           importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'qa-engineer', skill: 'git-basics',           importance: 7,  demandTier: importanceToTier(7)  },
    { prof: 'qa-engineer', skill: 'automation-testing',   importance: 8,  demandTier: importanceToTier(8)  },
    { prof: 'qa-engineer', skill: 'docker-basics',        importance: 5,  demandTier: importanceToTier(5)  },
    { prof: 'qa-engineer', skill: 'performance-testing',  importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'qa-engineer', skill: 'security-testing',     importance: 6,  demandTier: importanceToTier(6)  },
    { prof: 'qa-engineer', skill: 'qa-architecture',      importance: 4,  demandTier: importanceToTier(4)  },
  ];

  await Promise.all(
    profSkillLinks.map(({ prof, skill, importance, demandTier }) =>
      prisma.professionSkill.upsert({
        where: { professionId_skillId: { professionId: professions[prof]!.id, skillId: skills[skill]!.id } },
        update: { demandTier, importance },
        create: { professionId: professions[prof]!.id, skillId: skills[skill]!.id, importance, demandTier },
      })
    )
  );

  const prereqs: Array<[string, string]> = [
    ['http-rest',             'programming-basics'],
    ['sql-basics',            'programming-basics'],
    ['nodejs-express',        'http-rest'],
    ['nodejs-express',        'programming-basics'],
    ['postgresql',            'sql-basics'],
    ['auth-jwt',              'http-rest'],
    ['auth-jwt',              'nodejs-express'],
    ['docker-basics',         'linux-basics'],
    ['testing-backend',       'nodejs-express'],
    ['typescript-basics',     'javascript'],
    ['system-design-basics',  'nodejs-express'],
    ['system-design-basics',  'postgresql'],
    ['microservices',         'system-design-basics'],
    ['microservices',         'docker-basics'],
    ['performance-optimization', 'system-design-basics'],

    ['javascript',            'html-css'],
    ['react-basics',          'javascript'],
    ['react-basics',          'html-css'],
    ['bundlers',              'javascript'],
    ['testing-frontend',      'react-basics'],
    ['react-advanced',        'react-basics'],
    ['react-advanced',        'typescript-basics'],
    ['performance-frontend',  'react-advanced'],
    ['frontend-architecture', 'performance-frontend'],

    ['networking-basics',     'linux-basics'],
    ['docker-basics',         'linux-basics'],
    ['ci-cd',                 'docker-basics'],
    ['ci-cd',                 'git-basics'],
    ['kubernetes',            'docker-basics'],
    ['kubernetes',            'networking-basics'],
    ['terraform',             'linux-basics'],
    ['terraform',             'networking-basics'],
    ['monitoring',            'kubernetes'],
    ['platform-engineering',  'kubernetes'],
    ['platform-engineering',  'terraform'],
    ['platform-engineering',  'monitoring'],

    ['pandas-numpy',    'python-basics'],
    ['pandas-numpy',    'math-stats'],
    ['data-viz',        'pandas-numpy'],
    ['ml-basics',       'pandas-numpy'],
    ['ml-basics',       'math-stats'],
    ['deep-learning',   'ml-basics'],
    ['mlops',           'ml-basics'],
    ['mlops',           'docker-basics'],
    ['research-ml',     'deep-learning'],

    ['mobile-basics',       'javascript'],
    ['react-native',        'react-basics'],
    ['react-native',        'mobile-basics'],
    ['mobile-state',        'react-native'],
    ['mobile-performance',  'react-native'],
    ['native-modules',      'react-native'],
    ['mobile-architecture', 'mobile-performance'],
    ['mobile-architecture', 'native-modules'],

    ['test-documentation',  'testing-basics'],
    ['api-testing',         'http-rest'],
    ['api-testing',         'testing-basics'],
    ['automation-testing',  'api-testing'],
    ['automation-testing',  'javascript'],
    ['performance-testing', 'automation-testing'],
    ['security-testing',    'api-testing'],
    ['qa-architecture',     'performance-testing'],
    ['qa-architecture',     'security-testing'],
  ];

  await Promise.all(
    prereqs.map(([skillSlug, prereqSlug]) =>
      prisma.skillPrerequisite.upsert({
        where: { skillId_prerequisiteId: { skillId: skills[skillSlug]!.id, prerequisiteId: skills[prereqSlug]!.id } },
        update: {},
        create: { skillId: skills[skillSlug]!.id, prerequisiteId: skills[prereqSlug]!.id },
      })
    )
  );

  type ResDef = { title: string; url: string; type: ResourceType; language: string; description: string; skills: string[]; priority: number };

  const resDefs: ResDef[] = [
    { title: 'Современный учебник JavaScript', url: 'https://learn.javascript.ru', type: ResourceType.course, language: 'ru', description: 'Самый подробный русскоязычный учебник по JS и браузерному API.', skills: ['javascript', 'html-css'], priority: 10 },
    { title: 'Git — официальная книга (Pro Git)', url: 'https://git-scm.com/book/ru/v2', type: ResourceType.book, language: 'ru', description: 'Полная книга по Git на русском языке.', skills: ['git-basics'], priority: 9 },
    { title: 'Postman — документация', url: 'https://learning.postman.com/docs', type: ResourceType.docs, language: 'en', description: 'Официальная документация Postman для тестирования API.', skills: ['http-rest', 'api-testing'], priority: 8 },
    { title: 'Node.js — официальная документация', url: 'https://nodejs.org/ru/docs/', type: ResourceType.docs, language: 'ru', description: 'Официальная документация Node.js.', skills: ['nodejs-express'], priority: 10 },
    { title: 'Express.js — быстрый старт (Habr)', url: 'https://habr.com/ru/articles/623209/', type: ResourceType.article, language: 'ru', description: 'Введение в Express.js для начинающих.', skills: ['nodejs-express'], priority: 8 },
    { title: 'PostgreSQL Tutorial (ru)', url: 'https://postgresqltutorial.com', type: ResourceType.course, language: 'ru', description: 'Полный курс по PostgreSQL от основ до продвинутых тем.', skills: ['postgresql', 'sql-basics'], priority: 10 },
    { title: 'JWT — официальный сайт и введение', url: 'https://jwt.io/introduction', type: ResourceType.docs, language: 'en', description: 'Что такое JWT, как работает, дебаггер токенов.', skills: ['auth-jwt'], priority: 9 },
    { title: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', type: ResourceType.article, language: 'en', description: 'Самый популярный гид по System Design на GitHub.', skills: ['system-design-basics', 'microservices'], priority: 9 },
    { title: 'React — официальная документация', url: 'https://ru.react.dev', type: ResourceType.docs, language: 'ru', description: 'Официальная документация React на русском.', skills: ['react-basics', 'react-advanced'], priority: 10 },
    { title: 'TypeScript Handbook (официальный)', url: 'https://www.typescriptlang.org/docs/handbook/', type: ResourceType.docs, language: 'en', description: 'Официальный справочник по TypeScript.', skills: ['typescript-basics'], priority: 9 },
    { title: 'CSS Grid и Flexbox — Habr', url: 'https://habr.com/ru/articles/467049/', type: ResourceType.article, language: 'ru', description: 'Наглядное руководство по CSS Grid и Flexbox.', skills: ['html-css'], priority: 8 },
    { title: 'Vite — документация', url: 'https://vitejs.dev/guide/', type: ResourceType.docs, language: 'en', description: 'Официальная документация Vite.', skills: ['bundlers'], priority: 9 },
    { title: 'Vitest — документация', url: 'https://vitest.dev', type: ResourceType.docs, language: 'en', description: 'Документация Vitest и React Testing Library.', skills: ['testing-frontend', 'testing-backend'], priority: 8 },
    { title: 'Linux Command Line (Habr)', url: 'https://habr.com/ru/articles/501442/', type: ResourceType.article, language: 'ru', description: 'Основные команды Linux для разработчиков.', skills: ['linux-basics'], priority: 9 },
    { title: 'Docker — официальная документация', url: 'https://docs.docker.com/get-started/', type: ResourceType.docs, language: 'en', description: 'Getting started с Docker.', skills: ['docker-basics'], priority: 10 },
    { title: 'GitHub Actions — документация', url: 'https://docs.github.com/ru/actions', type: ResourceType.docs, language: 'ru', description: 'Создание CI/CD-пайплайнов в GitHub Actions.', skills: ['ci-cd'], priority: 9 },
    { title: 'Kubernetes — официальный туториал', url: 'https://kubernetes.io/ru/docs/tutorials/', type: ResourceType.course, language: 'ru', description: 'Интерактивные туториалы по Kubernetes.', skills: ['kubernetes'], priority: 10 },
    { title: 'Prometheus + Grafana (Habr)', url: 'https://habr.com/ru/articles/578744/', type: ResourceType.article, language: 'ru', description: 'Настройка мониторинга с Prometheus и Grafana.', skills: ['monitoring'], priority: 8 },
    { title: 'Python — официальная документация (ru)', url: 'https://docs.python.org/ru/3/', type: ResourceType.docs, language: 'ru', description: 'Официальная документация Python на русском.', skills: ['python-basics'], priority: 10 },
    { title: 'Pandas — документация', url: 'https://pandas.pydata.org/docs/', type: ResourceType.docs, language: 'en', description: 'Официальная документация Pandas.', skills: ['pandas-numpy'], priority: 9 },
    { title: 'Курс ML от Яндекса (ШАД)', url: 'https://academy.yandex.ru/handbook/ml', type: ResourceType.course, language: 'ru', description: 'Бесплатный курс по машинному обучению от Яндекса.', skills: ['ml-basics', 'math-stats'], priority: 10 },
    { title: 'PyTorch — официальный туториал', url: 'https://pytorch.org/tutorials/', type: ResourceType.course, language: 'en', description: 'Туториалы по PyTorch от основ до продвинутых моделей.', skills: ['deep-learning'], priority: 9 },
    { title: 'React Native — официальная документация', url: 'https://reactnative.dev/docs/getting-started', type: ResourceType.docs, language: 'en', description: 'Официальная документация React Native.', skills: ['react-native', 'mobile-basics'], priority: 10 },
    { title: 'React Navigation — документация', url: 'https://reactnavigation.org/docs/getting-started', type: ResourceType.docs, language: 'en', description: 'Навигация в React Native-приложениях.', skills: ['react-native'], priority: 8 },
    { title: 'ISTQB Syllabus (ru)', url: 'https://www.istqb.org/certifications/certified-tester-foundation-level', type: ResourceType.docs, language: 'ru', description: 'Официальный стандарт тестирования ISTQB FL.', skills: ['testing-basics', 'test-documentation'], priority: 9 },
    { title: 'Playwright — документация', url: 'https://playwright.dev/docs/intro', type: ResourceType.docs, language: 'en', description: 'E2E-тестирование с Playwright.', skills: ['automation-testing'], priority: 10 },
    { title: 'k6 — документация', url: 'https://grafana.com/docs/k6/latest/', type: ResourceType.docs, language: 'en', description: 'Нагрузочное тестирование с k6.', skills: ['performance-testing'], priority: 9 },
    { title: 'OWASP Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/', type: ResourceType.docs, language: 'en', description: 'Руководство по тестированию безопасности веб-приложений.', skills: ['security-testing'], priority: 9 },
  ];

  for (const r of resDefs) {
    let resource = await prisma.resource.findFirst({ where: { url: r.url, type: r.type, title: r.title } });
    if (!resource) {
      resource = await prisma.resource.create({
        data: { title: r.title, url: r.url, type: r.type, language: r.language, description: r.description },
      });
    }
    await Promise.all(
      r.skills.map((slug) =>
        prisma.skillResource.upsert({
          where: { skillId_resourceId: { skillId: skills[slug]!.id, resourceId: resource.id } },
          update: {},
          create: { skillId: skills[slug]!.id, resourceId: resource.id, priority: r.priority },
        })
      )
    );
  }

  console.log('Resources:', resDefs.length);
  console.log('Seed complete ✓');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
