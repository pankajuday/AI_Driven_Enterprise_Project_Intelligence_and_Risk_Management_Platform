import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Activity, MessageSquare, LayoutGrid, FileUp, Layers3, CheckCircle2, Clock3 } from 'lucide-react';
import { projectsApi, documentsApi, analysisApi } from '@/api';
import type { Project, DocumentRecord, AnalysisReport } from '@/types';

import DocumentsTab from './tabs/DocumentsTab';
import AnalysisTab from './tabs/AnalysisTab';
import ReportTab from './tabs/ReportTab';
import ChatTab from './tabs/ChatTab';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<{ status: string; pipeline_step?: string; risk_count?: number; doc_count?: number; missing_doc_types?: string[]; existing_doc_types?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const activeTab = getActiveTab(location.search);

  useEffect(() => {
    if (!projectId) return;
    const pid = projectId;
    let cancelled = false;

    async function loadProjectData() {
      try {
        const [projectRes, docsRes, statusRes, reportRes] = await Promise.allSettled([
          projectsApi.get(pid),
          documentsApi.list(pid),
          analysisApi.getStatus(pid),
          analysisApi.getReport(pid),
        ]);

        if (cancelled) return;

        if (projectRes.status === 'fulfilled') {
          setProject(projectRes.value.data);
        } else {
          console.error(projectRes.reason);
          navigate('/projects');
          return;
        }

        if (docsRes.status === 'fulfilled') {
          setDocuments(docsRes.value.data || []);
        } else {
          console.error(docsRes.reason);
          setDocuments([]);
        }

        if (statusRes.status === 'fulfilled') {
          setAnalysisStatus(statusRes.value.data);
        } else {
          console.error(statusRes.reason);
          setAnalysisStatus(null);
        }

        if (reportRes.status === 'fulfilled') {
          setReport(reportRes.value.data);
        } else {
          setReport(null);
        }
      } catch (err) {
        console.error(err);
        navigate('/projects');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjectData();

    return () => {
      cancelled = true;
    };
  }, [projectId, navigate]);

  if (loading) {
    return <div className="p-8"><div className="skeleton" style={{ height: 260 }} /></div>;
  }

  if (!project) return null;

  return (
    <div className="anim-fade-up" style={{ width: '100%' }}>
      <main style={{ width: '100%', minWidth: 0 }}>
        {activeTab === 'overview' && (
          <ProjectOverview
            project={project}
            documents={documents}
            report={report}
            analysisStatus={analysisStatus}
            onJump={(tab) => navigate(`/projects/${projectId}?tab=${tab}`)}
          />
        )}
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

function getActiveTab(search: string): 'overview' | 'docs' | 'analysis' | 'report' | 'chat' {
  const tab = new URLSearchParams(search).get('tab');
  if (tab === 'docs' || tab === 'analysis' || tab === 'report' || tab === 'chat' || tab === 'overview') {
    return tab;
  }
  return 'overview';
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 600, marginBottom: 6 }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function ProjectOverview({
  project,
  documents,
  report,
  analysisStatus,
  onJump,
}: {
  project: Project;
  documents: DocumentRecord[];
  report: AnalysisReport | null;
  analysisStatus: { status: string; pipeline_step?: string; risk_count?: number; doc_count?: number; missing_doc_types?: string[]; existing_doc_types?: string[] } | null;
  onJump: (tab: 'overview' | 'docs' | 'analysis' | 'report' | 'chat') => void;
}) {
  const health = project.current_health_score;
  const completedDocs = documents.filter(doc => doc.processing_status === 'completed').length;
  const pendingDocs = documents.filter(doc => doc.processing_status === 'pending' || doc.processing_status === 'processing').length;
  const totalRiskCount = report?.risks.length ?? analysisStatus?.risk_count ?? 0;
  const generatedDocCount = report?.generated_documents.length ?? analysisStatus?.doc_count ?? 0;
  const statusLabel = analysisStatus?.status ? analysisStatus.status.replaceAll('_', ' ') : project.status.replaceAll('_', ' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 1200 }}>
      <div className="card" style={{ padding: 22, display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.8fr)', gap: 16, alignItems: 'stretch' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
            Project Dashboard
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>{project.name}</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 760, margin: 0 }}>
            {project.description || 'This workspace centralizes files, analysis, reports, and chat into one dashboard.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            <span className="badge badge-indigo">{statusLabel}</span>
            <span className="badge badge-muted">Created {formatDate(project.created_at)}</span>
            <span className="badge badge-muted">Updated {formatDate(project.updated_at)}</span>
            {analysisStatus?.pipeline_step && <span className="badge badge-orange">{analysisStatus.pipeline_step.replaceAll('_', ' ')}</span>}
          </div>
        </div>

        <div style={{ padding: 18, borderRadius: 18, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>Health Score</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: getHealthColor(health ?? 0), lineHeight: 1 }}>{health ?? '--'}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>out of 100</div>
          </div>

          <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(Math.max(health ?? 0, 0), 100)}%`, height: '100%', borderRadius: 99, background: health == null ? 'var(--border)' : `linear-gradient(90deg, ${getHealthColor(health ?? 0)}, rgba(99,102,241,0.85))` }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>Risks: {totalRiskCount}</span>
            <span>Generated docs: {generatedDocCount}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <MetricCard label="Files" value={project.total_files} hint={`${completedDocs} completed`} icon={<FileUp size={16} />} />
        <MetricCard label="Chunks" value={project.total_chunks} hint={`${pendingDocs} pending review`} icon={<Layers3 size={16} />} />
        <MetricCard label="Pipeline" value={analysisStatus?.status ?? project.status} hint={analysisStatus?.pipeline_step ? analysisStatus.pipeline_step.replaceAll('_', ' ') : 'Workspace status'} icon={<Clock3 size={16} />} />
        <MetricCard label="Generated" value={generatedDocCount} hint={`${totalRiskCount} risks captured`} icon={<CheckCircle2 size={16} />} />
      </div>

      <div className="card" style={{ padding: 18, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 0.7fr)', gap: 14, alignItems: 'start' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Workspace status</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            {analysisStatus?.pipeline_step ? analysisStatus.pipeline_step.replaceAll('_', ' ') : 'No active pipeline'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InfoCard label="Risks" value={totalRiskCount} />
          <InfoCard label="Generated docs" value={generatedDocCount} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint, icon }: { label: string; value: number | string; hint: string; icon: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>{value}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}>{hint}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function docStatusColor(status: string) {
  if (status === 'completed' || status === 'indexed') return 'green';
  if (status === 'failed') return 'red';
  if (status === 'processing' || status === 'pending') return 'yellow';
  return 'muted';
}

function riskBadgeColor(severity: string) {
  if (severity === 'critical' || severity === 'high') return 'red';
  if (severity === 'medium') return 'yellow';
  return 'green';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
