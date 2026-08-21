import { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, FileText, ChevronDown, Download } from 'lucide-react';
import { analysisApi } from '@/api';
import type { AnalysisReport, RiskItem, GeneratedDocument } from '@/types';
import { ToMd } from '../../components/ToMd';
import DownloadPDF from '../../components/DownloadPDF';

export default function ReportTab({ projectId }: { projectId: string }) {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    analysisApi.getReport(projectId)
      .then(res => setReport(res.data))
      .catch(err => setError(err.response?.status === 404 ? 'No report found.' : 'Error loading report.'))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;
  
  if (error || !report) return (
    <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderStyle: 'dashed' }}>
      <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-secondary)' }}>{error || 'Run the analysis to generate a report.'}</p>
    </div>
  );


 

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top row: Health & Scope */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <HealthScoreCard report={report} />
        <ScopeSummaryCard report={report} />
      </div>

      {/* Risks Table */}
      <div className="card">
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} color="var(--warning)" />
          Risk Register ({report.risks.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 8px' }}>Risk</th>
                <th style={{ padding: '12px 8px' }}>Category</th>
                <th style={{ padding: '12px 8px' }}>Severity</th>
                <th style={{ padding: '12px 8px' }}>Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {report.risks.map((risk, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 500 }}>{risk.title}</td>
                  <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{risk.category}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={`badge badge-${getSeverityColor(risk.severity)}`}>
                      {risk.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{risk.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Documents */}
      <div className="card">
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>AI-Generated Documents</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {report.generated_documents.map((doc, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', cursor: 'pointer' }}
                onClick={() => setExpandedDoc(expandedDoc === doc.title ? null : doc.title)}
              >
                <span style={{ fontWeight: 600 }}>{doc.title}</span>
                <ChevronDown size={16} style={{ transform: expandedDoc === doc.title ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
              {expandedDoc === doc.title && (
                <div style={{ padding: '16px', background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ marginBottom: 16, fontSize: 12, padding: '4px 8px' }}
                    // onClick={() => downloadMarkdown(doc)}
                  >
                    <DownloadPDF markdown={doc.content} filename={`${doc.title}`}/>
                    
                    <Download size={14} />
                  </button>
                  <div className="markdown-body" style={{ whiteSpace: 'pre-wrap' }}>
                    <ToMd content={doc.content} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthScoreCard({ report }: { report: AnalysisReport }) {
  const score = report.health_score || 0;
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  
  return (
    <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h4 style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 16 }}>Health Score</h4>
      <div style={{ fontSize: 64, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
      <div style={{ marginTop: 24, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
        <BreakdownRow label="Scope Clarity" val={report.health_breakdown?.scope_clarity_percent} />
        <BreakdownRow label="Doc Completeness" val={report.health_breakdown?.documentation_completeness_percent} />
        <BreakdownRow label="Risk Density" val={report.health_breakdown?.risk_density_percent} />
        <BreakdownRow label="Schedule Risk" val={report.health_breakdown?.schedule_risk_percent} />
      </div>
    </div>
  );
}

function BreakdownRow({ label, val }: { label: string; val?: number }) {
  if (val == null) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{val}%</span>
    </div>
  );
}

function ScopeSummaryCard({ report }: { report: AnalysisReport }) {
  const s = report.scope;
  if (!s) return <div className="card">No scope data.</div>;
  
  return (
    <div className="card">
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Scope Summary</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{s.summary}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
        <div>
          <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: 4 }}>Key Deliverables</strong>
          <ul style={{ paddingLeft: 16, margin: 0, color: 'var(--text-primary)' }}>
            {s.deliverables.slice(0, 4).map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
        <div>
          <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: 4 }}>Stakeholders</strong>
          <ul style={{ paddingLeft: 16, margin: 0, color: 'var(--text-primary)' }}>
            {s.stakeholders.slice(0, 4).map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function getSeverityColor(sev: string) {
  if (sev === 'critical' || sev === 'high') return 'red';
  if (sev === 'medium') return 'yellow';
  return 'green';
}

function downloadMarkdown(doc: GeneratedDocument) {
  const blob = new Blob([doc.content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/\s+/g, '_').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
