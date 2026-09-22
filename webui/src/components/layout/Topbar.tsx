import { useState } from 'react';
import { useLocation } from 'react-router';
import { cn } from '@/lib/utils'

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/projects': { title: 'My Projects', subtitle: 'Browse project workspaces and jump back into analysis' },
  '/projects/new': { title: 'Create Project', subtitle: 'Start a new project workspace and upload source documents' },
};

export default function Topbar() {
  const location = useLocation();
  const currentPage =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/projects/')
      ? { title: 'Project Workspace', subtitle: 'Documents, analysis, report, and chat in one place' }
      : { title: 'Project Intel', subtitle: 'AI-driven project risk and document intelligence' });
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-16 bg-[rgba(15,15,26,0.82)] backdrop-blur border-b border-(--border) flex items-center justify-between px-7 shrink-0">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-(--text-muted) font-semibold">
          Project Intel
        </div>
        <div className="text-sm font-semibold text-(--text-primary) leading-tight">
          {currentPage.title}
        </div>
        {currentPage.subtitle && (
          <div className="text-xs text-(--text-muted)">
            {currentPage.subtitle}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className={cn(
            'bg-(--bg-elevated) border border-(--border) rounded-full px-4 py-2 text-[13px] w-70 flex items-center gap-2 transition-colors',
            'focus-within:border-(--border-glow)'
          )}
        >
          <span className="text-(--text-muted)">🔍</span>
          <input
            type="text"
            placeholder="Search across documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-(--text-primary) placeholder:text-(--text-muted) font-[inherit]"
          />
        </div>

        <button
          onClick={() => alert('Export started...')}
          className="px-4 py-2 rounded-md text-[13px] font-semibold text-(--text-secondary) border border-(--border) hover:bg-(--bg-elevated) hover:text-(--text-primary) transition-all"
        >
          📤 Export
        </button>

        <button
          onClick={() => alert('New Analysis modal would open')}
          className="px-4 py-2 rounded-md text-[13px] font-semibold text-white bg-(--accent) hover:bg-[#151536] shadow-lg shadow-[rgba(99,102,241,0.25)] transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          ➕ New Analysis
        </button>
      </div>
    </div>
  );
}