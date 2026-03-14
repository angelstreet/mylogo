import { ReactNode, useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

interface Props {
  children: ReactNode;
  onLogout: () => void;
}

/**
 * Responsive layout:
 * - Desktop (md+): Collapsible sidebar on the left
 * - Mobile (<md): Bottom navigation bar
 */
export default function Layout({ children, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('app_sidebar_collapsed');
    return stored === null ? true : stored === 'true';
  });

  // Listen for sidebar toggle events (from Sidebar component)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCollapsed(detail.collapsed);
    };
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Main content — shifts right on desktop based on sidebar width */}
      <main
        className={`pb-24 md:pb-0 px-4 md:px-8 pt-3 max-w-6xl w-full transition-all duration-200 ${
          collapsed ? 'md:ml-16' : 'md:ml-56'
        }`}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
