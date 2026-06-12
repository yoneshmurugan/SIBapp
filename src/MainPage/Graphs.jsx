import Graph from './Components/Graph';
import useFetch from '../hooks/useFetch';
import { useMemo, useState } from 'react';

function StatPill({ label, value, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center px-3 py-2.5 rounded-2xl border transition-all duration-200 active:scale-95 flex-1"
      style={
        active
          ? { backgroundColor: color + '18', borderColor: color + '50' }
          : { backgroundColor: 'transparent', borderColor: 'transparent' }
      }
    >
      <span
        className="text-lg font-black tabular-nums leading-none"
        style={{ color: active ? color : '#94a3b8' }}
      >
        {value}
      </span>
      <span
        className="text-[9px] font-black uppercase tracking-[0.12em] mt-1"
        style={{ color: active ? color : '#94a3b8' }}
      >
        {label}
      </span>
      {active && (
        <span
          className="w-5 h-[2px] rounded-full mt-1.5"
          style={{ backgroundColor: color }}
        />
      )}
    </button>
  );
}

function Graphs() {
  const [activeSeries, setActiveSeries] = useState('all');

  const { data, loading, error } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/weekstats`,
    { method: 'GET', credentials: 'include' }
  );

  const stats = useMemo(() => {
    if (!data) return { referrals: 0, tyftb: 0, m2m: 0 };
    const sum = arr => (arr || []).reduce((acc, curr) => acc + (curr.count || 0), 0);
    return {
      referrals: sum(data.referral_given),
      tyftb: sum(data.tyftb_given),
      m2m: sum(data.M2M),
    };
  }, [data]);

  const totalActivity = stats.referrals + stats.tyftb + stats.m2m;

  const seriesData = [
    { key: 'all',            label: 'All',       value: totalActivity,    color: '#f59e0b' },
    { key: 'referral_given', label: 'Referral',  value: stats.referrals,  color: '#3b82f6' },
    { key: 'tyftb_given',    label: 'TYFTB',     value: stats.tyftb,      color: '#ef4444' },
    { key: 'M2Ms',           label: 'M2Ms',      value: stats.m2m,        color: '#8b5cf6' },
  ];

  const active = seriesData.find(s => s.key === activeSeries) || seriesData[0];

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-3xl px-4 pt-5 pb-4 border border-gray-100 dark:border-gray-800 shadow-md dark:shadow-none">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none">
              Activity Trends
            </h3>
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mt-0.5">
              Weekly Performance
            </p>
          </div>
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ color: active.color, backgroundColor: active.color + '18' }}
          >
            Live
          </span>
        </div>

        {/* Filter Pills Row */}
        <div className="flex gap-1 mb-4">
          {seriesData.map(s => (
            <StatPill
              key={s.key}
              label={s.label}
              value={loading ? '–' : s.value}
              color={s.color}
              active={activeSeries === s.key}
              onClick={() => setActiveSeries(s.key)}
            />
          ))}
        </div>

        {/* Graph */}
        <div className="w-full h-[200px]">
          <Graph
            data={data}
            loading={loading}
            error={error}
            activeSeries={activeSeries}
            accentColor={active.color}
          />
        </div>
      </div>
    </div>
  );
}

export default Graphs;