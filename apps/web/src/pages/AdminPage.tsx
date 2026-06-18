import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Pencil, X, Link2, Unlink } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import type { SkillLevel } from '@skillatlas/shared';

const LEVELS: SkillLevel[] = ['Junior', 'Middle', 'Senior', 'Expert'];
type ResourceType = 'article' | 'video' | 'course' | 'book' | 'docs' | 'practice';
const RESOURCE_TYPES: ResourceType[] = ['article', 'video', 'course', 'book', 'docs', 'practice'];

interface AdminProfession {
  id: string;
  slug: string;
  title: string;
  summary: string;
  salaryMedian: number | null;
}

interface AdminSkill {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: SkillLevel;
  category: string;
}

interface SkillLink {
  skill: { id: string; slug: string; title: string };
  priority: number;
}

interface AdminResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  language: string;
  description: string | null;
  skillResources: SkillLink[];
}

interface ProfSkillLink {
  professionId: string;
  skillId: string;
  importance: number;
  skill: { id: string; slug: string; title: string; level: SkillLevel };
}

interface PrereqLink {
  skillId: string;
  prerequisiteId: string;
  prerequisite: { id: string; slug: string; title: string; level: SkillLevel };
}

interface ProfessionForm { slug: string; title: string; summary: string; salaryMedian: string }
interface SkillForm { slug: string; title: string; description: string; level: SkillLevel; category: string }
interface ResourceForm { title: string; url: string; type: ResourceType; language: string; description: string }

const emptyProfForm: ProfessionForm = { slug: '', title: '', summary: '', salaryMedian: '' };
const emptySkillForm: SkillForm = { slug: '', title: '', description: '', level: 'Junior', category: '' };
const emptyResForm: ResourceForm = { title: '', url: '', type: 'article', language: 'ru', description: '' };

function profToForm(p: AdminProfession): ProfessionForm {
  return { slug: p.slug, title: p.title, summary: p.summary, salaryMedian: p.salaryMedian?.toString() ?? '' };
}
function skillToForm(s: AdminSkill): SkillForm {
  return { slug: s.slug, title: s.title, description: s.description, level: s.level, category: s.category };
}
function resToForm(r: AdminResource): ResourceForm {
  return { title: r.title, url: r.url, type: r.type, language: r.language, description: r.description ?? '' };
}

function levelColor(level: string): string {
  const map: Record<string, string> = { Junior: '#22c55e', Middle: '#3b82f6', Senior: '#f59e0b', Expert: '#ef4444' };
  return map[level] ?? '#6366f1';
}

const inputCls = 'px-3 py-2 rounded-lg border text-sm';
const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text)', borderColor: 'var(--border)' };

export function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [professions, setProfessions] = useState<AdminProfession[]>([]);
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [resources, setResources] = useState<AdminResource[]>([]);

  const [profForm, setProfForm] = useState<ProfessionForm>(emptyProfForm);
  const [skillForm, setSkillForm] = useState<SkillForm>(emptySkillForm);
  const [resForm, setResForm] = useState<ResourceForm>(emptyResForm);

  const [editingProf, setEditingProf] = useState<AdminProfession | null>(null);
  const [editingSkill, setEditingSkill] = useState<AdminSkill | null>(null);
  const [editingRes, setEditingRes] = useState<AdminResource | null>(null);

  const [editProfForm, setEditProfForm] = useState<ProfessionForm>(emptyProfForm);
  const [editSkillForm, setEditSkillForm] = useState<SkillForm>(emptySkillForm);
  const [editResForm, setEditResForm] = useState<ResourceForm>(emptyResForm);

  const [linkSlug, setLinkSlug] = useState('');
  const [linkPriority, setLinkPriority] = useState('0');

  const [profError, setProfError] = useState<string | null>(null);
  const [skillError, setSkillError] = useState<string | null>(null);
  const [resError, setResError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [profSkillLinks, setProfSkillLinks] = useState<ProfSkillLink[]>([]);
  const [profSkillSlug, setProfSkillSlug] = useState('');
  const [profSkillImportance, setProfSkillImportance] = useState('1');
  const [profSkillError, setProfSkillError] = useState<string | null>(null);

  const [prereqLinks, setPrereqLinks] = useState<PrereqLink[]>([]);
  const [prereqSlug, setPrereqSlug] = useState('');
  const [prereqError, setPrereqError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (user.role !== 'ADMIN') { navigate('/'); return; }
    void loadAll();
  }, [user, navigate]);

  async function loadAll() {
    setLoadError(null);
    try {
      const [p, s, r] = await Promise.all([
        api.get<AdminProfession[]>('/admin/professions'),
        api.get<AdminSkill[]>('/admin/skills'),
        api.get<AdminResource[]>('/admin/resources'),
      ]);
      setProfessions(p);
      setSkills(s);
      setResources(r);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    }
  }

  async function handleDeleteProfession(id: string) {
    if (!confirm('Удалить профессию?')) return;
    await api.delete(`/admin/professions/${id}`);
    setProfessions((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleCreateProfession(e: React.FormEvent) {
    e.preventDefault();
    setProfError(null);
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        slug: profForm.slug.trim(), title: profForm.title.trim(), summary: profForm.summary.trim(),
      };
      if (profForm.salaryMedian.trim()) body['salaryMedian'] = parseInt(profForm.salaryMedian, 10);
      const created = await api.post<AdminProfession>('/admin/professions', body);
      setProfessions((prev) => [...prev, created]);
      setProfForm(emptyProfForm);
    } catch (err) {
      setProfError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally { setBusy(false); }
  }

  async function openEditProf(p: AdminProfession) {
    setEditingProf(p); setEditProfForm(profToForm(p)); setEditError(null);
    setProfSkillLinks([]); setProfSkillSlug(''); setProfSkillImportance('1'); setProfSkillError(null);
    try {
      const links = await api.get<ProfSkillLink[]>(`/admin/professions/${p.id}/skills`);
      setProfSkillLinks(links);
    } catch { }
  }

  async function handleSaveProf(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProf) return;
    setEditError(null); setBusy(true);
    try {
      const body: Record<string, unknown> = {
        slug: editProfForm.slug.trim(), title: editProfForm.title.trim(), summary: editProfForm.summary.trim(),
        salaryMedian: editProfForm.salaryMedian.trim() ? parseInt(editProfForm.salaryMedian, 10) : null,
      };
      const updated = await api.patch<AdminProfession>(`/admin/professions/${editingProf.id}`, body);
      setProfessions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingProf((prev) => prev ? { ...prev, ...updated } : null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally { setBusy(false); }
  }

  async function handleLinkProfSkill() {
    if (!editingProf || !profSkillSlug.trim()) return;
    setProfSkillError(null); setBusy(true);
    try {
      const linked = await api.post<{ skillId: string; slug: string; title: string; level: SkillLevel }>(
        `/admin/professions/${editingProf.id}/skills`,
        { skillSlug: profSkillSlug.trim(), importance: parseInt(profSkillImportance, 10) || 1 },
      );
      const newLink: ProfSkillLink = {
        professionId: editingProf.id,
        skillId: linked.skillId,
        importance: parseInt(profSkillImportance, 10) || 1,
        skill: { id: linked.skillId, slug: linked.slug, title: linked.title, level: linked.level },
      };
      setProfSkillLinks((prev) => [...prev.filter((l) => l.skillId !== linked.skillId), newLink]);
      setProfSkillSlug(''); setProfSkillImportance('1');
    } catch (err) {
      setProfSkillError(err instanceof Error ? err.message : 'Навык не найден');
    } finally { setBusy(false); }
  }

  async function handleUnlinkProfSkill(skillId: string) {
    if (!editingProf) return;
    await api.delete(`/admin/professions/${editingProf.id}/skills/${skillId}`);
    setProfSkillLinks((prev) => prev.filter((l) => l.skillId !== skillId));
  }

  async function handleDeleteSkill(id: string) {
    if (!confirm('Удалить навык?')) return;
    await api.delete(`/admin/skills/${id}`);
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleCreateSkill(e: React.FormEvent) {
    e.preventDefault();
    setSkillError(null); setBusy(true);
    try {
      const body = {
        slug: skillForm.slug.trim(), title: skillForm.title.trim(),
        description: skillForm.description.trim(), level: skillForm.level, category: skillForm.category.trim(),
      };
      const created = await api.post<AdminSkill>('/admin/skills', body);
      setSkills((prev) => [...prev, created]);
      setSkillForm(emptySkillForm);
    } catch (err) {
      setSkillError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally { setBusy(false); }
  }

  async function openEditSkill(s: AdminSkill) {
    setEditingSkill(s); setEditSkillForm(skillToForm(s)); setEditError(null);
    setPrereqLinks([]); setPrereqSlug(''); setPrereqError(null);
    try {
      const links = await api.get<PrereqLink[]>(`/admin/skills/${s.id}/prerequisites`);
      setPrereqLinks(links);
    } catch { }
  }

  async function handleSaveSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSkill) return;
    setEditError(null); setBusy(true);
    try {
      const body = {
        slug: editSkillForm.slug.trim(), title: editSkillForm.title.trim(),
        description: editSkillForm.description.trim(), level: editSkillForm.level, category: editSkillForm.category.trim(),
      };
      const updated = await api.patch<AdminSkill>(`/admin/skills/${editingSkill.id}`, body);
      setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSkill((prev) => prev ? { ...prev, ...updated } : null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally { setBusy(false); }
  }

  async function handleLinkPrereq() {
    if (!editingSkill || !prereqSlug.trim()) return;
    setPrereqError(null); setBusy(true);
    try {
      const linked = await api.post<{ prerequisiteId: string; slug: string; title: string; level: SkillLevel }>(
        `/admin/skills/${editingSkill.id}/prerequisites`,
        { prerequisiteSlug: prereqSlug.trim() },
      );
      const newLink: PrereqLink = {
        skillId: editingSkill.id,
        prerequisiteId: linked.prerequisiteId,
        prerequisite: { id: linked.prerequisiteId, slug: linked.slug, title: linked.title, level: linked.level },
      };
      setPrereqLinks((prev) => [...prev.filter((l) => l.prerequisiteId !== linked.prerequisiteId), newLink]);
      setPrereqSlug('');
    } catch (err) {
      setPrereqError(err instanceof Error ? err.message : 'Навык не найден');
    } finally { setBusy(false); }
  }

  async function handleUnlinkPrereq(prereqId: string) {
    if (!editingSkill) return;
    await api.delete(`/admin/skills/${editingSkill.id}/prerequisites/${prereqId}`);
    setPrereqLinks((prev) => prev.filter((l) => l.prerequisiteId !== prereqId));
  }

  async function handleDeleteResource(id: string) {
    if (!confirm('Удалить ресурс?')) return;
    await api.delete(`/admin/resources/${id}`);
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    setResError(null); setBusy(true);
    try {
      const body: Record<string, unknown> = {
        title: resForm.title.trim(), url: resForm.url.trim(),
        type: resForm.type, language: resForm.language.trim(),
      };
      if (resForm.description.trim()) body['description'] = resForm.description.trim();
      const created = await api.post<AdminResource>('/admin/resources', body);
      setResources((prev) => [...prev, { ...created, skillResources: [] }]);
      setResForm(emptyResForm);
    } catch (err) {
      setResError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally { setBusy(false); }
  }

  function openEditRes(r: AdminResource) {
    setEditingRes(r); setEditResForm(resToForm(r));
    setEditError(null); setLinkError(null); setLinkSlug(''); setLinkPriority('0');
  }

  async function handleSaveRes(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRes) return;
    setEditError(null); setBusy(true);
    try {
      const body: Record<string, unknown> = {
        title: editResForm.title.trim(), url: editResForm.url.trim(),
        type: editResForm.type, language: editResForm.language.trim(),
      };
      if (editResForm.description.trim()) body['description'] = editResForm.description.trim();
      const updated = await api.patch<AdminResource>(`/admin/resources/${editingRes.id}`, body);
      setResources((prev) => prev.map((r) => r.id === updated.id ? { ...updated, skillResources: editingRes.skillResources } : r));
      setEditingRes((prev) => prev ? { ...prev, ...updated } : null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally { setBusy(false); }
  }

  async function handleLinkSkill() {
    if (!editingRes || !linkSlug.trim()) return;
    setLinkError(null); setBusy(true);
    try {
      const linked = await api.post<{ skillId: string; slug: string; title: string }>(
        `/admin/resources/${editingRes.id}/link`,
        { skillSlug: linkSlug.trim(), priority: parseInt(linkPriority, 10) || 0 },
      );
      const newLink: SkillLink = { skill: { id: linked.skillId, slug: linked.slug, title: linked.title }, priority: parseInt(linkPriority, 10) || 0 };
      const updatedLinks = [...editingRes.skillResources.filter((l) => l.skill.id !== linked.skillId), newLink];
      setEditingRes((prev) => prev ? { ...prev, skillResources: updatedLinks } : null);
      setResources((prev) => prev.map((r) => r.id === editingRes.id ? { ...r, skillResources: updatedLinks } : r));
      setLinkSlug(''); setLinkPriority('0');
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Навык не найден');
    } finally { setBusy(false); }
  }

  async function handleUnlinkSkill(skillId: string) {
    if (!editingRes) return;
    await api.delete(`/admin/resources/${editingRes.id}/link/${skillId}`);
    const updatedLinks = editingRes.skillResources.filter((l) => l.skill.id !== skillId);
    setEditingRes((prev) => prev ? { ...prev, skillResources: updatedLinks } : null);
    setResources((prev) => prev.map((r) => r.id === editingRes.id ? { ...r, skillResources: updatedLinks } : r));
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      <h1 className="text-2xl font-bold">Админка</h1>

      {loadError && (
        <div className="rounded-lg px-4 py-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400">
          {loadError}
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Профессии</h2>
        <div className="rounded-xl border overflow-hidden mb-6" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-2">Slug</th>
                <th className="text-left px-4 py-2">Title</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {professions.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-4 text-center" style={{ color: 'var(--text-muted)' }}>Нет профессий</td></tr>
              )}
              {professions.map((p) => (
                <tr key={p.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{p.slug}</td>
                  <td className="px-4 py-2">{p.title}</td>
                  <td className="px-4 py-2 text-right space-x-1">
                    <button onClick={() => { void openEditProf(p); }} className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Редактировать">
                      <Pencil size={15} className="text-blue-500" />
                    </button>
                    <button onClick={() => { void handleDeleteProfession(p.id); }} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30" title="Удалить">
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={(e) => { void handleCreateProfession(e); }} className="space-y-3">
          <h3 className="font-medium">Создать профессию</h3>
          {profError && <p className="text-sm text-red-500">{profError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="slug" value={profForm.slug} onChange={(e) => setProfForm((f) => ({ ...f, slug: e.target.value }))} className={inputCls} style={inputStyle} />
            <input required placeholder="title" value={profForm.title} onChange={(e) => setProfForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} style={inputStyle} />
            <input placeholder="salaryMedian (число)" value={profForm.salaryMedian} onChange={(e) => setProfForm((f) => ({ ...f, salaryMedian: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <textarea required placeholder="summary" value={profForm.summary} onChange={(e) => setProfForm((f) => ({ ...f, summary: e.target.value }))} rows={3} className={`w-full ${inputCls}`} style={inputStyle} />
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ background: 'var(--accent)', color: '#fff' }}>
            Создать профессию
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Навыки</h2>
        <div className="rounded-xl border overflow-hidden mb-6" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-2">Slug</th>
                <th className="text-left px-4 py-2">Title</th>
                <th className="text-left px-4 py-2">Level</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {skills.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-4 text-center" style={{ color: 'var(--text-muted)' }}>Нет навыков</td></tr>
              )}
              {skills.map((s) => (
                <tr key={s.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{s.slug}</td>
                  <td className="px-4 py-2">{s.title}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: levelColor(s.level) + '20', color: levelColor(s.level) }}>{s.level}</span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-1">
                    <button onClick={() => { void openEditSkill(s); }} className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Редактировать">
                      <Pencil size={15} className="text-blue-500" />
                    </button>
                    <button onClick={() => { void handleDeleteSkill(s.id); }} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30" title="Удалить">
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={(e) => { void handleCreateSkill(e); }} className="space-y-3">
          <h3 className="font-medium">Создать навык</h3>
          {skillError && <p className="text-sm text-red-500">{skillError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="slug" value={skillForm.slug} onChange={(e) => setSkillForm((f) => ({ ...f, slug: e.target.value }))} className={inputCls} style={inputStyle} />
            <input required placeholder="title" value={skillForm.title} onChange={(e) => setSkillForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} style={inputStyle} />
            <input required placeholder="category" value={skillForm.category} onChange={(e) => setSkillForm((f) => ({ ...f, category: e.target.value }))} className={inputCls} style={inputStyle} />
            <select value={skillForm.level} onChange={(e) => setSkillForm((f) => ({ ...f, level: e.target.value as SkillLevel }))} className={inputCls} style={inputStyle}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <textarea required placeholder="description" value={skillForm.description} onChange={(e) => setSkillForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={`w-full ${inputCls}`} style={inputStyle} />
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ background: 'var(--accent)', color: '#fff' }}>
            Создать навык
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Ресурсы</h2>
        <div className="rounded-xl border overflow-hidden mb-6" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-2">Title</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Язык</th>
                <th className="text-left px-4 py-2">Навыки</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center" style={{ color: 'var(--text-muted)' }}>Нет ресурсов</td></tr>
              )}
              {resources.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-2 max-w-xs truncate" title={r.title}>{r.title}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{r.type}</span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{r.language}</td>
                  <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>{r.skillResources.length}</td>
                  <td className="px-4 py-2 text-right space-x-1">
                    <button onClick={() => openEditRes(r)} className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Редактировать">
                      <Pencil size={15} className="text-blue-500" />
                    </button>
                    <button onClick={() => { void handleDeleteResource(r.id); }} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30" title="Удалить">
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={(e) => { void handleCreateResource(e); }} className="space-y-3">
          <h3 className="font-medium">Создать ресурс</h3>
          {resError && <p className="text-sm text-red-500">{resError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="title" value={resForm.title} onChange={(e) => setResForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} style={inputStyle} />
            <input required placeholder="url" type="url" value={resForm.url} onChange={(e) => setResForm((f) => ({ ...f, url: e.target.value }))} className={inputCls} style={inputStyle} />
            <select value={resForm.type} onChange={(e) => setResForm((f) => ({ ...f, type: e.target.value as ResourceType }))} className={inputCls} style={inputStyle}>
              {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="язык (ru / en)" value={resForm.language} onChange={(e) => setResForm((f) => ({ ...f, language: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <textarea placeholder="description (необязательно)" value={resForm.description} onChange={(e) => setResForm((f) => ({ ...f, description: e.target.value }))} rows={2} className={`w-full ${inputCls}`} style={inputStyle} />
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ background: 'var(--accent)', color: '#fff' }}>
            Создать ресурс
          </button>
        </form>
      </section>

      {editingProf && (
        <Modal title="Редактировать профессию" onClose={() => setEditingProf(null)} wide>
          {editError && <p className="text-sm text-red-500">{editError}</p>}
          <form onSubmit={(e) => { void handleSaveProf(e); }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="slug" value={editProfForm.slug} onChange={(e) => setEditProfForm((f) => ({ ...f, slug: e.target.value }))} className={inputCls} style={inputStyle} />
              <input required placeholder="title" value={editProfForm.title} onChange={(e) => setEditProfForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} style={inputStyle} />
              <input placeholder="salaryMedian (число)" value={editProfForm.salaryMedian} onChange={(e) => setEditProfForm((f) => ({ ...f, salaryMedian: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <textarea required placeholder="summary" value={editProfForm.summary} onChange={(e) => setEditProfForm((f) => ({ ...f, summary: e.target.value }))} rows={3} className={`w-full ${inputCls}`} style={inputStyle} />
            <ModalActions onCancel={() => setEditingProf(null)} busy={busy} saveLabel="Сохранить поля" />
          </form>

          <div className="pt-4 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-medium mb-2">Навыки профессии</h4>
            {profSkillLinks.length === 0 && (
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Нет привязанных навыков</p>
            )}
            <ul className="space-y-1 mb-3">
              {profSkillLinks.map(({ skill, importance }) => (
                <li key={skill.id} className="flex items-center justify-between text-sm px-2 py-1 rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full mr-2" style={{ background: levelColor(skill.level) + '20', color: levelColor(skill.level) }}>{skill.level}</span>
                    <span className="font-mono text-xs mr-2" style={{ color: 'var(--text-muted)' }}>{skill.slug}</span>
                    {skill.title}
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>важность={importance}</span>
                  </span>
                  <button onClick={() => { void handleUnlinkProfSkill(skill.id); }} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30" title="Отвязать">
                    <Unlink size={13} className="text-red-400" />
                  </button>
                </li>
              ))}
            </ul>
            {profSkillError && <p className="text-xs text-red-500 mb-1">{profSkillError}</p>}
            <div className="flex gap-2 items-center">
              <input
                placeholder="slug навыка"
                value={profSkillSlug}
                onChange={(e) => setProfSkillSlug(e.target.value)}
                className={`flex-1 ${inputCls}`}
                style={inputStyle}
              />
              <input
                placeholder="важность"
                type="number"
                value={profSkillImportance}
                onChange={(e) => setProfSkillImportance(e.target.value)}
                className={`w-24 ${inputCls}`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => { void handleLinkProfSkill(); }}
                disabled={busy || !profSkillSlug.trim()}
                className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Link2 size={14} /> Привязать
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingSkill && (
        <Modal title="Редактировать навык" onClose={() => setEditingSkill(null)} wide>
          {editError && <p className="text-sm text-red-500">{editError}</p>}
          <form onSubmit={(e) => { void handleSaveSkill(e); }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="slug" value={editSkillForm.slug} onChange={(e) => setEditSkillForm((f) => ({ ...f, slug: e.target.value }))} className={inputCls} style={inputStyle} />
              <input required placeholder="title" value={editSkillForm.title} onChange={(e) => setEditSkillForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} style={inputStyle} />
              <input required placeholder="category" value={editSkillForm.category} onChange={(e) => setEditSkillForm((f) => ({ ...f, category: e.target.value }))} className={inputCls} style={inputStyle} />
              <select value={editSkillForm.level} onChange={(e) => setEditSkillForm((f) => ({ ...f, level: e.target.value as SkillLevel }))} className={inputCls} style={inputStyle}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <textarea required placeholder="description" value={editSkillForm.description} onChange={(e) => setEditSkillForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={`w-full ${inputCls}`} style={inputStyle} />
            <ModalActions onCancel={() => setEditingSkill(null)} busy={busy} saveLabel="Сохранить поля" />
          </form>

          <div className="pt-4 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-medium mb-2">Пресреквизиты</h4>
            {prereqLinks.length === 0 && (
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Нет пресреквизитов</p>
            )}
            <ul className="space-y-1 mb-3">
              {prereqLinks.map(({ prerequisite }) => (
                <li key={prerequisite.id} className="flex items-center justify-between text-sm px-2 py-1 rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full mr-2" style={{ background: levelColor(prerequisite.level) + '20', color: levelColor(prerequisite.level) }}>{prerequisite.level}</span>
                    <span className="font-mono text-xs mr-2" style={{ color: 'var(--text-muted)' }}>{prerequisite.slug}</span>
                    {prerequisite.title}
                  </span>
                  <button onClick={() => { void handleUnlinkPrereq(prerequisite.id); }} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30" title="Убрать">
                    <Unlink size={13} className="text-red-400" />
                  </button>
                </li>
              ))}
            </ul>
            {prereqError && <p className="text-xs text-red-500 mb-1">{prereqError}</p>}
            <div className="flex gap-2 items-center">
              <input
                placeholder="slug навыка-пресреквизита"
                value={prereqSlug}
                onChange={(e) => setPrereqSlug(e.target.value)}
                className={`flex-1 ${inputCls}`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => { void handleLinkPrereq(); }}
                disabled={busy || !prereqSlug.trim()}
                className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Link2 size={14} /> Добавить
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingRes && (
        <Modal title="Редактировать ресурс" onClose={() => setEditingRes(null)} wide>
          {editError && <p className="text-sm text-red-500">{editError}</p>}
          <form onSubmit={(e) => { void handleSaveRes(e); }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="title" value={editResForm.title} onChange={(e) => setEditResForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} style={inputStyle} />
              <input required placeholder="url" type="url" value={editResForm.url} onChange={(e) => setEditResForm((f) => ({ ...f, url: e.target.value }))} className={inputCls} style={inputStyle} />
              <select value={editResForm.type} onChange={(e) => setEditResForm((f) => ({ ...f, type: e.target.value as ResourceType }))} className={inputCls} style={inputStyle}>
                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input placeholder="язык (ru / en)" value={editResForm.language} onChange={(e) => setEditResForm((f) => ({ ...f, language: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <textarea placeholder="description" value={editResForm.description} onChange={(e) => setEditResForm((f) => ({ ...f, description: e.target.value }))} rows={2} className={`w-full ${inputCls}`} style={inputStyle} />
            <ModalActions onCancel={null} busy={busy} saveLabel="Сохранить поля" />
          </form>

          <div className="pt-4 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-medium mb-2">Привязанные навыки</h4>
            {editingRes.skillResources.length === 0 && (
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Нет привязанных навыков</p>
            )}
            <ul className="space-y-1 mb-3">
              {editingRes.skillResources.map(({ skill, priority }) => (
                <li key={skill.id} className="flex items-center justify-between text-sm px-2 py-1 rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <span>
                    <span className="font-mono text-xs mr-2" style={{ color: 'var(--text-muted)' }}>{skill.slug}</span>
                    {skill.title}
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>p={priority}</span>
                  </span>
                  <button onClick={() => { void handleUnlinkSkill(skill.id); }} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30" title="Отвязать">
                    <Unlink size={13} className="text-red-400" />
                  </button>
                </li>
              ))}
            </ul>
            {linkError && <p className="text-xs text-red-500 mb-1">{linkError}</p>}
            <div className="flex gap-2 items-center">
              <input
                placeholder="slug навыка"
                value={linkSlug}
                onChange={(e) => setLinkSlug(e.target.value)}
                className={`flex-1 ${inputCls}`}
                style={inputStyle}
              />
              <input
                placeholder="priority"
                type="number"
                value={linkPriority}
                onChange={(e) => setLinkPriority(e.target.value)}
                className={`w-20 ${inputCls}`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => { void handleLinkSkill(); }}
                disabled={busy || !linkSlug.trim()}
                className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Link2 size={14} /> Привязать
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full rounded-xl p-6 space-y-4 shadow-xl overflow-y-auto max-h-[90vh] ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:opacity-70"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, busy, saveLabel = 'Сохранить' }: {
  onCancel: (() => void) | null;
  busy: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ background: 'var(--accent)', color: '#fff' }}>
        {saveLabel}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
          Отмена
        </button>
      )}
    </div>
  );
}
