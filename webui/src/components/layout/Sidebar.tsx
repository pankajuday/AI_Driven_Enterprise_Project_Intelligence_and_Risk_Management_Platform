import { NavLink, useNavigate } from 'react-router';
import { Brain, FolderOpen, Plus, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        gap: 4,
        overflowY: 'auto',
      }}
    >
      {/*  Logo  */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '4px 10px 20px',
          marginBottom: 4,
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
            AI-Driven Enterprise Project Intelligence & Risk Management Platform
          </div>
        </div>
      </div>

      {/*  Navigation  */}
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700, padding: '12px 10px 6px' }}>
        Navigation
      </div>

      <NavLink
        to="/projects"
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        style={({ isActive }) => navStyle(isActive)}
      >
        <FolderOpen size={16} />
        <span>My Projects</span>
        <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
      </NavLink>

      {/*  New Project CTA  */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => navigate('/projects/new')}
        >
          <Plus size={15} />
          New Project
        </button>
      </div>
    </aside>
  );
}

function navStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 10,
    fontSize: 13.5,
    fontWeight: 500,
    textDecoration: 'none',
    color: isActive ? '#a5b4fc' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-soft)' : 'transparent',
    border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  };
}