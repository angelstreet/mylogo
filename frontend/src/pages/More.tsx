import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, LucideIcon } from 'lucide-react';

// ---- CUSTOMIZE: Add links to pages not in bottom nav ----
const links: { path: string; icon: LucideIcon; label: string }[] = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];
// ---- END CUSTOMIZE ----

/**
 * "More" page for mobile — lists all pages not in the bottom nav.
 */
export default function More() {
  const navigate = useNavigate();

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">More</h1>
      <div className="space-y-1">
        {links.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="flex-1 text-left text-sm font-medium">{label}</span>
            <ChevronRight size={16} className="text-text-secondary/50" />
          </button>
        ))}
      </div>
    </div>
  );
}
