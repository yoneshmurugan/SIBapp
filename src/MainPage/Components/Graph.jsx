import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { transformWeeklyData } from '../../utils/dataTransform.mjs';

const ALL_SERIES = [
  { key: 'referral_given', label: 'Referrals', color: '#3b82f6' },
  { key: 'tyftb_given',   label: 'TYFTB',     color: '#ef4444' },
  { key: 'M2Ms',          label: 'M2Ms',      color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 min-w-[130px]">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{entry.name}</span>
            </div>
            <span className="text-[11px] font-black text-gray-900 dark:text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function SkeletonLoader() {
  return (
    <div className="w-full h-full rounded-2xl bg-gray-50 dark:bg-gray-800/30 animate-pulse" />
  );
}

export default function RevenueAreaChart({ data, loading, error, activeSeries = 'all', accentColor = '#f59e0b' }) {
  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Failed to load data</p>
      </div>
    );
  }

  const chartData = data ? transformWeeklyData(data) : [];
  const visibleSeries = activeSeries === 'all' ? ALL_SERIES : ALL_SERIES.filter(s => s.key === activeSeries);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
        <defs>
          {ALL_SERIES.map(s => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke="currentColor"
          className="opacity-[0.06]"
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em' }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: accentColor, strokeWidth: 1.5, strokeDasharray: '4 4', opacity: 0.5 }}
        />

        {visibleSeries.map(s => (
          <Area
            key={s.key}
            name={s.label}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2.5}
            fill={`url(#grad-${s.key})`}
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: s.color }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
