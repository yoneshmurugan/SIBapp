import React, { useEffect, useMemo, useState } from 'react';
import { Users, Briefcase, Handshake, UserPlus, TrendingUp, RefreshCw, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

// --- Tab Button ---
const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-200 border whitespace-nowrap
      ${active
        ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white shadow-sm'
        : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      }`}
  >
    {label}
  </button>
);

// approved = data from getactivity (status === true)
// pending  = data from getactivityupcoming (status === false / not yet approved)
const MetricRow = ({ icon: Icon, label, approved, pending, onClick }) => {
  const pendingNum = typeof pending === 'string' ? parseFloat(pending.replace(/[₹,]/g, '')) : pending;
  const hasPending = pendingNum > 0;

  return (
    <button
      onClick={onClick}
      className="w-full grid grid-cols-[1fr_70px_60px] items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 active:bg-amber-50/60 dark:active:bg-gray-800/40 transition-colors text-left"
    >
      {/* Label + Icon */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-gray-400 dark:text-gray-500" />
        </div>
        <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate">{label}</span>
      </div>

      {/* Pending badge */}
      <div className="flex justify-end">
        {hasPending ? (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800 whitespace-nowrap">
            <Clock size={9} />
            {pending}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-gray-300 dark:text-gray-700">—</span>
        )}
      </div>

      {/* Approved count */}
      <div className="text-right">
        <span className={`text-[13px] font-black tabular-nums ${
          approved === 0 || approved === '₹0' || approved === '0'
            ? 'text-gray-300 dark:text-gray-700'
            : 'text-gray-900 dark:text-white'
        }`}>
          {approved}
        </span>
      </div>
    </button>
  );
};

// --- Skeleton ---
const SkeletonLoader = () => (
  <div className="px-4 py-2 space-y-1">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
        <div className="flex-1 h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-32" />
        <div className="h-5 w-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    ))}
  </div>
);

// --- Tabs config ---
const TABS = [
  { label: 'This Month', value: 'amonth' },
  { label: '6 Months',   value: '6months' },
  { label: 'Lifetime',   value: 'full' },
];

// --- Main ---
function Activity() {
  const [activeTab, setActiveTab] = useState('amonth');
  const [approved, setApproved] = useState(null);
  const [pending,  setPending]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const navigate = useNavigate();

  const base = import.meta.env.VITE_BACKEND_SERVER;

  const approvedUrl = useMemo(() => `${base}/dashboard/getactivity/${activeTab}`,         [base, activeTab]);
  const pendingUrl  = useMemo(() => `${base}/dashboard/getactivityupcoming/${activeTab}`,  [base, activeTab]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [r1, r2] = await Promise.all([
          fetch(approvedUrl, { method: 'GET', credentials: 'include' }),
          fetch(pendingUrl,  { method: 'GET', credentials: 'include' }),
        ]);
        if (!r1.ok) throw new Error(`Activity fetch failed: ${r1.status}`);
        if (!r2.ok) throw new Error(`Pending fetch failed: ${r2.status}`);
        const [j1, j2] = await Promise.all([r1.json(), r2.json()]);
        if (!cancelled) { setApproved(j1); setPending(j2); }
      } catch (err) {
        if (!cancelled) { setError(err.message); setApproved(null); setPending(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [approvedUrl, pendingUrl]);

  const val = (obj, ...keys) => {
    for (const key of keys) {
      const v = obj?.[key];
      if (v === undefined || v === null) continue;
      if (typeof v === 'object' && v.$numberDecimal !== undefined) {
        const n = parseFloat(v.$numberDecimal);
        return isNaN(n) ? 0 : n;
      }
      const n = Number(v);
      return isNaN(n) ? v : n;
    }
    return 0;
  };

  const fmt  = (n) => n.toLocaleString('en-IN');
  const curr = (obj, ...keys) => `₹${fmt(val(obj, ...keys))}`;
  const num  = (obj, ...keys) => fmt(val(obj, ...keys));

  const goTo = (type, direction, status = 'all') =>
    () => navigate(`/myactivity?type=${type}&direction=${direction}&status=${status}`);

  const metrics = [
    { icon: UserPlus,   label: 'Referrals Given',    approved: num(approved,  'referral_given'),                    pending: num(pending, 'referral_given'),                    onClick: goTo('referral', 'given') },
    { icon: Users,      label: 'Referrals Received',  approved: num(approved,  'referral_received'),                  pending: num(pending, 'referral_received'),                  onClick: goTo('referral', 'received') },
    { icon: Briefcase,  label: 'TYB Given',           approved: curr(approved, 'business_given1', 'tyftb_given'),      pending: curr(pending, 'business_given1', 'tyftb_given'),      onClick: goTo('tyftb', 'given') },
    { icon: TrendingUp, label: 'TYB Received',        approved: curr(approved, 'business_made',   'tyftb_received'),   pending: curr(pending, 'business_made',   'tyftb_received'),   onClick: goTo('tyftb', 'received') },
    { icon: Handshake,  label: '1-to-1 Meetings',     approved: num(approved,  'M2Ms'),                                pending: num(pending, 'M2Ms'),                                onClick: goTo('m2m', 'all') },
  ];

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

        {/* Header Section */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <NavLink to="/myactivity" className="flex items-center gap-1.5 group">
              <div>
                <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight group-active:text-amber-600 transition-colors">My Activity</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Performance Tracker</p>
              </div>
              <ArrowRight size={13} className="text-gray-300 dark:text-gray-600 group-active:text-amber-500 transition-colors mt-0.5" />
            </NavLink>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-800/50 p-0.5 rounded-full gap-0.5 w-fit">
            {TABS.map(tab => (
              <TabButton key={tab.value} label={tab.label} active={activeTab === tab.value} onClick={() => setActiveTab(tab.value)} />
            ))}
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_70px_60px] px-4 py-2 bg-gray-50/80 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 text-[9px] font-black uppercase tracking-widest text-gray-400">
          <div>Metric</div>
          <div className="text-right pr-1">Pending</div>
          <div className="text-right">Approved</div>
        </div>

        {/* Rows */}
        {loading ? (
          <SkeletonLoader />
        ) : error && !approved ? (
          <div className="py-10 flex flex-col items-center justify-center text-center px-6">
            <p className="text-xs font-bold text-red-500 mb-1">Failed to load</p>
            <p className="text-[10px] text-gray-400">{error}</p>
          </div>
        ) : (
          <div>
            {metrics.map((item, idx) => (
              <MetricRow key={idx} {...item} />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending approval</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={10} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approved count</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Activity;