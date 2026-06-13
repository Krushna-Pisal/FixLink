import { useAuthStore } from '../../store/authStore';
import { User } from 'lucide-react';

export default function TopBar() {
  const { user } = useAuthStore();

  return (
    <header
      className="h-12 flex items-center justify-between px-5 border-b flex-shrink-0"
      style={{
        background: 'rgba(9,11,16,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}>

      <div />
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-fl-accent-soft flex items-center justify-center">
          <User size={13} className="text-fl-accent" />
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-fl-primary leading-none">{user?.displayName || 'Agent'}</p>
          <p className="text-xs text-fl-muted leading-none mt-0.5">{user?.email}</p>
        </div>
      </div>
    </header>
  );
}
