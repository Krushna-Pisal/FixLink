import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const colorMap = {
  LOW:      '#22C55E',
  MEDIUM:   '#3B82F6',
  HIGH:     '#F59E0B',
  CRITICAL: '#EF4444',
};

// Custom tooltip styled to match the iOS glass aesthetic
function GlassTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(18,22,32,0.90)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: '12px',
      padding: '8px 12px',
      fontSize: '12px',
      color: '#F0F4FF',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: colorMap[payload[0]?.payload?.name] || '#64748B' }} className="font-semibold">
        {payload[0]?.payload?.name}
      </p>
      <p style={{ color: '#F0F4FF', marginTop: 2 }}>
        {payload[0]?.value} session{payload[0]?.value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function SeverityChart({ data }) {
  if (!data) return null;
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-2xl p-4 animate-fade-in"
      style={{
        background: 'rgba(18,22,32,0.70)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
      }}>
      <p className="text-sm font-semibold mb-4" style={{ color: 'var(--fl-text-primary)' }}>
        Severity Breakdown
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={26} barGap={4}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#5A6882', fontSize: 10, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#5A6882', fontSize: 10, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={24}
          />
          <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map(entry => (
              <Cell
                key={entry.name}
                fill={colorMap[entry.name] || '#64748B'}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
