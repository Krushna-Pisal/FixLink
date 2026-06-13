import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, LogOut, Zap } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r"
      style={{
        background: 'rgba(9,11,16,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}>

      {/* Logo */}
      <div className="px-4 py-5 border-b border-fl-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-fl-accent rounded-md flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-fl-primary tracking-tight">FixLink</span>
        </div>
        <p className="text-fl-muted text-xs mt-1 leading-snug">See the problem. Fix it faster.</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-fl-accent-soft text-fl-accent'
                  : 'text-fl-muted hover:text-fl-primary hover:bg-fl-border/30'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-fl-border">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm text-fl-muted hover:text-fl-danger hover:bg-fl-danger/10 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
