import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { Brain, FolderOpen, Plus, ChevronRight, ChevronDown, LayoutGrid, RefreshCw, Search, Activity } from 'lucide-react';
import { projectsApi } from '@/api';
import type { Project } from '@/types';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const currentProjectId = location.pathname.match(/^\/projects\/([^/]+)/)?.[1];

  const loadProjects = () => {
    setLoading(true);
    projectsApi.list()
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (currentProjectId) {
      setExpandedProjectId(currentProjectId);
    }
  }, [currentProjectId]);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.updated_at || b.created_at).getTime();
      return bTime - aTime;
    });
  }, [projects]);

  return (
    <aside
      style={{
        width: 300,
        minWidth: 300,
        background: 'linear-gradient(180deg, rgba(15,15,26,0.96), rgba(10,10,18,0.98))',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px 14px',
        gap: 10,
        overflowY: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 10px 14px',
          marginBottom: 2,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            // background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            backgroundColor:"#02040e",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            flexShrink: 0,
          }}
        >
          <Brain size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Project Intel
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
            Notion-style project workspace
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
        <button
          className="btn btn-ghost"
          style={{ flex: 1, justifyContent: 'center', padding: '8px 10px', fontSize: 12 }}
          onClick={loadProjects}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center', padding: '8px 10px', fontSize: 12 }}
          onClick={() => navigate('/projects/new')}
        >
          <Plus size={14} />
          New
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 4px' }}>
        <NavLink
          to="/projects"
          style={({ isActive }) => navStyle(isActive)}
        >
          <LayoutGrid size={16} />
          <span>All Projects</span>
          <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
        </NavLink>

        {/* <NavLink
          to="/projects/new"
          style={({ isActive }) => navStyle(isActive)}
        >
          <Plus size={16} />
          <span>New Project</span>
          <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
        </NavLink> */}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 8px 0', color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <Search size={12} />
        Projects
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>{sortedProjects.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 4px', minHeight: 0, flex: 1 }}>
        {loading ? (
          <div className="skeleton" style={{ height: 180, borderRadius: 14 }} />
        ) : sortedProjects.length === 0 ? (
          <div style={{ padding: '14px 12px', borderRadius: 14, border: '1px dashed var(--border)', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
            No projects yet. Create one to start the workspace.
          </div>
        ) : (
          sortedProjects.map(project => {
            const projectId = project.id || (project as any)._id;
            const active = currentProjectId === projectId;
            const expanded = expandedProjectId === projectId;
            return (
              <div key={projectId} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => navigate(`/projects/${projectId}?tab=overview`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '11px 12px',
                      borderRadius: 14,
                      border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                      background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: active ? '#021023' : 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FolderOpen size={15} color={active ? '#a5b4fc' : 'var(--text-muted)'} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {project.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                        <Activity size={11} />
                        <span>{project.total_files} docs</span>
                        <span>·</span>
                        <span>{project.current_health_score ?? '--'}/100</span>
                      </div>
                    </div>
                  </button>
                  <button
                    aria-label={expanded ? 'Collapse project details' : 'Expand project details'}
                    onClick={() => setExpandedProjectId(expanded ? null : projectId)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                  </button>
                </div>

                {expanded && (
                  <div style={{ marginLeft: 14, paddingLeft: 12, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      { key: 'overview', label: 'Overview' },
                      { key: 'docs', label: 'Documents' },
                      { key: 'analysis', label: 'Analysis' },
                      { key: 'report', label: 'Report' },
                      { key: 'chat', label: 'Chat' },
                    ].map(item => {
                      const activeTab = location.pathname === `/projects/${projectId}` && new URLSearchParams(location.search).get('tab') === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => navigate(`/projects/${projectId}?tab=${item.key}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 10,
                            border: activeTab ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                            background: activeTab ? 'rgba(99,102,241,0.08)' : 'transparent',
                            color: activeTab ? '#c7d2fe' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 12.5,
                            fontWeight: activeTab ? 700 : 500,
                          }}
                        >
                          <span>{item.label}</span>
                          <ChevronRight size={12} style={{ opacity: 0.4 }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </aside>
  );
}

function navStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 12,
    fontSize: 13.5,
    fontWeight: 600,
    textDecoration: 'none',
    color: isActive ? '#a5b4fc' : 'var(--text-secondary)',
    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
    border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  };
}