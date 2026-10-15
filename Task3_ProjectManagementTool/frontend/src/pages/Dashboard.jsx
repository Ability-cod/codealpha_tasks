import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { token } = useAuth();
  const { notify } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const load = () => api('/projects', { token }).then(setProjects).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setCreating(true);
    try {
      await api('/projects', { method: 'POST', token, body: form });
      setForm({ name: '', description: '' });
      setShowForm(false);
      notify('Project created');
      load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="feed-layout">
      <div className="page-head">
        <h1 className="page-title">Your projects</h1>
        <button className="btn btn-sm" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : 'New project'}
        </button>
      </div>

      {showForm && (
        <form className="panel form-stack" onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="p-name">Project name</label>
            <input id="p-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="p-desc">Description (optional)</label>
            <textarea id="p-desc" className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn" disabled={creating}>{creating ? 'Creating...' : 'Create project'}</button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to start organizing tasks.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
              <h3>{p.name}</h3>
              <p>{p.description || 'No description'}</p>
              <div className="project-meta">
                <span>{p.member_count} {p.member_count === 1 ? 'member' : 'members'}</span>
                <span>{p.task_count} {p.task_count === 1 ? 'task' : 'tasks'}</span>
                {p.role === 'owner' && <span className="badge owner-badge">Owner</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}