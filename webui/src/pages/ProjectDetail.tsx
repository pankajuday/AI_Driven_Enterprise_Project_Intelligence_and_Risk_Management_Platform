import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, FolderOpen, Activity, FileText, MessageSquare } from 'lucide-react';
import { projectsApi } from '@/api';
import type { Project } from '@/types';

import DocumentsTab from './tabs/DocumentsTab';
import AnalysisTab from './tabs/AnalysisTab';
import ReportTab from './tabs/ReportTab';
import ChatTab from './tabs/ChatTab';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'docs' | 'analysis' | 'report' | 'chat'>('docs');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    projectsApi.get(projectId)
      .then(res => setProject(res.data))
      .catch(err => {
        console.error(err);
        navigate('/projects'); // redirect if not found
      })
      .finally(() => setLoading(false));
  }, [projectId, navigate]);

  if (loading) {
    return <div className="p-8"><div className="skeleton" style={{ height: 260 }} /></div>;
  }

  if (!project) return null;

  const tabs = [
    { id: 'docs', label: 'Documents', icon: <FolderOpen size={16} /> },
    { id: 'analysis', label: 'Analysis', icon: <Activity size={16} /> },
    { id: 'report', label: 'Report', icon: <FileText size={16} /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} /> },
  ] as const;

  return (
    <div className="anim-fade-up" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* ── Project Details Sidebar ────────────────────────────────────────── */}
      <aside 
        style={{ 
          width: 260, 
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Back link & Project Card */}
        <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: 12, border: 'none', alignSelf: 'flex-start', marginLeft: -4 }}
            onClick={() => navigate('/projects')}
          >
            <ChevronLeft size={15} /> Projects
          </button>

          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>
              {project.name}
            </h1>
            {project.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>
                {project.description}
              </p>
            )}
          </div>

          {project.current_health_score != null && (
            <div 
              style={{ 
                padding: '10px 14px', 
                background: 'var(--bg-elevated)', 
                borderRadius: 10,
                border: '1px solid var(--border)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Health Score
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: getHealthColor(project.current_health_score) }}>
                {project.current_health_score}/100
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Tabs List */}
        <div className="card" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div 
            style={{ 
              fontSize: 10.5, 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              color: 'var(--text-muted)', 
              padding: '8px 12px 6px' 
            }}
          >
            Project Views
          </div>
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#a5b4fc' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ color: isActive ? '#818cf8' : 'var(--text-muted)' }}>{t.icon}</span>
                <span style={{ flex: 1 }}>{t.label}</span>
                {isActive && (
                  <div 
                    style={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      background: '#818cf8', 
                      boxShadow: '0 0 8px #818cf8' 
                    }} 
                  />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Active Tab Content Area ────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 320 }}>
        {activeTab === 'docs' && <DocumentsTab projectId={projectId!} />}
        {activeTab === 'analysis' && <AnalysisTab projectId={projectId!} />}
        {activeTab === 'report' && <ReportTab projectId={projectId!} />}
        {activeTab === 'chat' && <ChatTab projectId={projectId!} />}
      </main>
    </div>
  );
}

function getHealthColor(score: number) {
  if (score >= 70) return 'var(--success)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--danger)';
}
