import { useState } from 'react';
import { useLocation } from 'react-router';
import { cn } from '@/lib/utils'

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Project Dashboard', subtitle: 'Last updated 12 minutes ago · 12 documents indexed' },
  '/documents': { title: 'Document Repository', subtitle: 'Upload and manage project artifacts for RAG indexing' },
  '/insights': { title: 'AI Insights', subtitle: 'Key findings from your project documents' },
  '/risks': { title: 'Risk Register', subtitle: 'AI-identified risks from your project documents' },
  '/scope': { title: 'Scope & Deliverables', subtitle: 'AI-extracted from project proposals and SRS documents' },
  '/stories': { title: 'Generated User Stories', subtitle: 'AI-generated from SRS and meeting notes' },
  '/forecast': { title: 'Delivery Forecast', subtitle: 'AI-powered schedule and resource predictions' },
  '/members': { title: 'Team Members', subtitle: '8 members · 2 on PTO next week' },
  '/settings': { title: 'Settings', subtitle: 'Configure your project intelligence preferences' },
};

export default function Topbar() {
  const location = useLocation();
  const currentPage = pageTitles[location.pathname] || { title: 'Project Dashboard' };
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-16 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-7 flex-shrink-0">
      {/* Breadcrumb / Page Title */}
      <div>
        <div className="text-sm text-[#737373]">
          Projects / <span className="text-[#f5f5f5] font-semibold">E-Commerce Platform v2.0</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className={cn(
            'bg-[#141414] border border-[#2a2a2a] rounded-full px-4 py-2 text-[13px] w-[280px] flex items-center gap-2 transition-colors',
            'focus-within:border-orange-500'
          )}
        >
          <span className="text-[#737373]">🔍</span>
          <input
            type="text"
            placeholder="Search across documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-[#a3a3a3] placeholder:text-[#737373] font-[inherit]"
          />
        </div>

        <button
          onClick={() => alert('Export started...')}
          className="px-4 py-2 rounded-md text-[13px] font-semibold text-[#a3a3a3] border border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-[#f5f5f5] transition-all"
        >
          📤 Export
        </button>

        <button
          onClick={() => alert('New Analysis modal would open')}
          className="px-4 py-2 rounded-md text-[13px] font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          ➕ New Analysis
        </button>
      </div>
    </div>
  );
}