import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, ChevronLeft } from 'lucide-react';
import { projectsApi } from '@/api';

export default function CreateProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const res = await projectsApi.create({ name, description });
      // Navigate to project detail view after creation
      navigate(`/projects/${res.data.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anim-fade-up" style={{ maxWidth: 600, margin: '40px auto 0' }}>
      <button
        className="btn btn-ghost"
        style={{ marginBottom: 24, padding: '6px 12px' }}
        onClick={() => navigate('/projects')}
      >
        <ChevronLeft size={16} /> Back to Projects
      </button>

      <div className="card">
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Create New Project</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Start a new AI-powered risk analysis workspace.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Project Name *
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Q3 Migration Project"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Description (Optional)
            </label>
            <textarea
              className="input"
              placeholder="Briefly describe the project goals..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/projects')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus size={16} /> Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
