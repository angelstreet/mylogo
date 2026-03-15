import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

// ---- CUSTOMIZE: Add your nav items here ----
interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
}

interface NavGroup {
  label: string; // empty string = no header
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: '',
    items: [
      { path: '/', icon: Sparkles, label: 'Generate' },
    ],
  },
  // Add more groups:
  // {
  //   label: 'Section Name',
  //   items: [
  //     { path: '/items', icon: List, label: 'Items' },
  //   ],
  // },
];
// ---- END CUSTOMIZE ----

interface Props {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('app_sidebar_collapsed');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('app_sidebar_collapsed', String(collapsed));
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed } }));
  }, [collapsed]);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-bg-elevated border-r border-border flex flex-col transition-all duration-200 z-50 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Collapse toggle */}
      <div className="px-3 py-4 border-b border-border flex items-center justify-between min-h-[56px]">
        <img src="/mylogo/logo.png" alt="MyLogo" className="h-8 w-auto" />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/50">
                {group.label}
              </div>
            )}
            {group.label && collapsed && (
              <div className="border-t border-border/50 mx-2 my-1" />
            )}
            <div className="space-y-0.5">
              {group.items.map(({ path, icon: Icon, label, disabled }) => {
                const active = pathname === path || (path !== '/' && pathname.startsWith(path));
                return (
                  <button
                    key={path}
                    onClick={() => !disabled && navigate(path)}
                    disabled={disabled}
                    title={collapsed ? label : undefined}
                    className={`w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-2'
                    } ${
                      disabled
                        ? 'text-text-secondary/30 cursor-not-allowed'
                        : active
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                    {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings + Logout */}
      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <button
          onClick={() => navigate('/settings')}
          title={collapsed ? 'Settings' : undefined}
          className={`w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors ${
            collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-2'
          } ${
            pathname === '/settings'
              ? 'bg-accent/10 text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          <Settings size={18} strokeWidth={pathname === '/settings' ? 2.5 : 1.5} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
