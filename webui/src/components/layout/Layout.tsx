import { Outlet, Link, useLocation } from 'react-router';
import { Brain, FolderKanban } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-[#080810] text-[#f0f0ff] font-sans flex flex-col">
      {/* Premium Global Navigation Header */}
      <header
        style={{
          position: 'relative',
          top: 0,
          bottom: 10,
          zIndex: 0,
          background: 'rgba(15, 15, 26, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/projects" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#021023',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Brain size={18} color="#f0f0ff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Project Intel
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
              AI-Driven Project Risk & Document Intelligence
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            to="/projects"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: location.pathname.startsWith('/projects') ? '#a5b4fc' : 'var(--text-secondary)',
              background: location.pathname.startsWith('/projects') ? 'var(--accent-soft)' : 'transparent',
              border: location.pathname.startsWith('/projects') ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
            }}
          >
            <FolderKanban size={15} />
            <span>My Projects</span>
          </Link>
        </div>
      </header>

      {/* Main content body centered */}
      <main style={{ flex: 1, padding: '28px 24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
