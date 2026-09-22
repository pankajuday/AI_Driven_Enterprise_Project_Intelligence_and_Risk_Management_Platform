import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-sans flex overflow-hidden">
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar />

        <main style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '24px 20px 28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
