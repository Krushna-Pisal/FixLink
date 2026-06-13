import { Activity, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const tileConfig = {
  active:   { icon: Activity,      label: 'Active sessions', glow: 'glow-green', iconBg: 'rgba(34,197,94,0.12)',   iconColor: '#22C55E' },
  today:    { icon: TrendingUp,    label: 'Sessions today',  glow: 'glow-blue',  iconBg: 'rgba(59,130,246,0.12)',  iconColor: '#3B82F6' },
  total:    { icon: CheckCircle2,  label: 'Total sessions',  glow: 'glow-amber', iconBg: 'rgba(245,158,11,0.12)',  iconColor: '#F59E0B' },
  duration: { icon: Clock,         label: 'Avg. duration',   glow: '',           iconBg: 'rgba(90,104,130,0.15)',  iconColor: '#5A6882' },
};

function StatTile({ cfg, value }) {
  const Icon = cfg.icon;
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 animate-fade-in"
      style={{
        background: 'rgba(18,22,32,0.70)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
      }}>

      {/* Subtle top-right corner shine */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${cfg.iconColor}18, transparent 70%)` }} />

      <div className="flex items-start justify-between">
        <div>
          <p className={`text-3xl font-bold tracking-tight ${cfg.glow}`}
            style={{ color: 'var(--fl-text-primary)' }}>
            {value}
          </p>
          <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--fl-text-muted)' }}>
            {cfg.label}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.iconBg }}>
          <Icon size={16} style={{ color: cfg.iconColor }} />
        </div>
      </div>
    </div>
  );
}

export function StatsRow({ data }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile cfg={tileConfig.active}   value={data.activeSessions ?? 0} />
      <StatTile cfg={tileConfig.today}    value={data.totalToday ?? 0} />
      <StatTile cfg={tileConfig.total}    value={data.totalAll ?? 0} />
      <StatTile cfg={tileConfig.duration} value={`${data.avgDurationMinutes ?? 0}m`} />
    </div>
  );
}
