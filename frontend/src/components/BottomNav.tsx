import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, MoreHorizontal, LucideIcon } from 'lucide-react';

// ---- CUSTOMIZE: Add your mobile nav items (max 5) ----
const items: { path: string; icon: LucideIcon; label: string }[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  // Add 2-3 more key pages here
  { path: '/more', icon: MoreHorizontal, label: 'More' },
];

// Paths that count as "More" (update when adding pages)
const morePaths = ['/more', '/settings'];
// ---- END CUSTOMIZE ----

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-elevated border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around max-w-lg mx-auto">
        {items.map(({ path, icon: Icon, label }) => {
          const active = path === '/more'
            ? morePaths.includes(pathname)
            : pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center py-3 px-3 text-xs transition-colors min-h-[56px] justify-center ${
                active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
