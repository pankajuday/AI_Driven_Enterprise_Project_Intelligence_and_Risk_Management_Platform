import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, FolderOpen, Zap, FileText, Trash2, ChevronRight, Activity, AlertTriangle } from 'lucide-react';
import { projectsApi } from '@/api';
import type { Project } from '@/types';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    projectsApi.list()
      .then(r => setProjects(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its data?')) return;
    await projectsApi.delete(id);
    setProjects(p => p.filter(x => x.id !== id));
  };

  return (
    <div className="anim-fade-up" style={{ width: '100%', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>My Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} · AI-Driven Enterprise Project Intelligence & Risk Management Platform
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
          <Plus size={15} />
          New Project
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => navigate('/projects/new')} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(p => {
            const pId = p.id || (p as any)._id;
            return (
              <ProjectCard
                key={pId}
                project={p}
                onClick={() => navigate(`/projects/${pId}`)}
                onDelete={e => handleDelete(e, pId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project: p, onClick, onDelete }: {
  project: Project;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const health = p.current_health_score;
  const healthColor = health == null ? 'var(--text-muted)'
    : health >= 70 ? 'var(--success)'
    : health >= 40 ? 'var(--warning)'
    : 'var(--danger)';

  const statusBadge = statusMeta(p.status);

  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: 'pointer', position: 'relative', padding: 20 }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-soft), rgba(139,92,246,0.15))',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FolderOpen size={18} color="#a5b4fc" />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className={`badge badge-${statusBadge.color}`}>{statusBadge.label}</span>
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: 12 }}
            onClick={onDelete}
            title="Delete project"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Name & desc */}
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
      {p.description && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
          {p.description.slice(0, 80)}{p.description.length > 80 ? '...' : ''}
        </p>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <FileText size={12} /> {p.total_files} docs
        </span>
        {health != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: healthColor, fontWeight: 600 }}>
            <Activity size={12} /> {health}/100
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          Open <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      background: 'var(--bg-surface)',
      borderRadius: 20,
      border: '1px dashed var(--border)',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'var(--accent-soft)',
        border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Zap size={32} color="#a5b4fc" />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No projects yet</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Create your first project to start analyzing risks and generating insights.
      </p>
      <button className="btn btn-primary" onClick={onNew}>
        <Plus size={15} /> Create First Project
      </button>
    </div>
  );
}

function statusMeta(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    created:          { label: 'New',        color: 'muted' },
    uploading:        { label: 'Uploading',  color: 'indigo' },
    indexing:         { label: 'Indexing',   color: 'indigo' },
    analysis_pending: { label: 'Pending',    color: 'yellow' },
    analysis_running: { label: 'Analyzing',  color: 'indigo' },
    analysis_ready:   { label: 'Ready',      color: 'green' },
    completed:        { label: 'Complete',   color: 'green' },
    failed:           { label: 'Failed',     color: 'red' },
    archived:         { label: 'Archived',   color: 'muted' },
  };
  return map[status] ?? { label: status, color: 'muted' };
}
