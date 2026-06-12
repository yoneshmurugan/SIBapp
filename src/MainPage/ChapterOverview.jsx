import React, { useMemo } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { NavLink } from "react-router-dom";

function ChapterOverview() {
  const { data: overviewData, loading: overviewLoading, error: overviewError } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/getchapteroverview`,
    { method: "GET", credentials: "include" }
  );

  const { data: meetingsData, loading: meetingsLoading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/meeting/getmeetings`,
    { method: "GET", credentials: "include" }
  );

  // Fetch all M2M slips for the chapter, count unapproved (status === false)
  const { data: m2mData } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/slips/one2one/getone2ones`,
    { method: "GET", credentials: "include" }
  );

  const loading = overviewLoading || meetingsLoading;

  const nextMeeting = useMemo(() => {
    if (!meetingsData || !Array.isArray(meetingsData) || meetingsData.length === 0)
      return "Not scheduled";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = meetingsData
      .filter(m => new Date(m.meeting_date) >= today)
      .sort((a, b) => new Date(a.meeting_date) - new Date(b.meeting_date));
    if (!future.length) return "None upcoming";
    return new Date(future[0].meeting_date).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }, [meetingsData]);

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return amount ?? "—";
    if (amount >= 10_00_000) return `₹${(amount / 10_00_000).toFixed(1)}L`;
    if (amount >= 1_000)    return `₹${(amount / 1_000).toFixed(1)}K`;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  // Count M2Ms where status is false (pending/unapproved)
  const m2mPending = useMemo(() => {
    if (!Array.isArray(m2mData)) return "—";
    return m2mData.filter(m => m.status === false).length;
  }, [m2mData]);

  const stats = overviewData ? [
    { label: "Members",    value: overviewData.totalMembers,           sub: "active" },
    { label: "Revenue",    value: formatCurrency(overviewData.totalRevenue), sub: "chapter total" },
    { label: "M2M Pending", value: m2mPending,                        sub: "awaiting approval", highlight: m2mPending > 0 },
  ] : [];

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300">

      {/* Gradient header band */}
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

      <div className="p-4">

        {/* Error */}
        {overviewError && (
          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-3 py-2 mb-3">
            <AlertCircle size={13} className="shrink-0" />
            Failed to load chapter data
          </div>
        )}

        {/* Chapter name + live dot */}
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
          </div>
        ) : overviewData ? (
          <>
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-snug pr-2">
                {overviewData.chapterName}
              </h2>
              {/* Live indicator */}
              <span className="flex h-2.5 w-2.5 mt-1.5 shrink-0 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
            </div>

            {/* Next meeting pill */}
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-4">
              <Calendar size={11} />
              Next meeting: {nextMeeting}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center text-center py-3 px-2 rounded-2xl transition-all active:scale-95 ${
                    s.highlight
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800"
                      : "bg-gray-50 dark:bg-gray-800/50 border border-transparent"
                  }`}
                >
                  <span className={`text-base font-black tabular-nums leading-none ${
                    s.highlight ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"
                  }`}>
                    {s.value}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                    {s.label}
                  </span>
                  <span className="text-[8px] text-gray-300 dark:text-gray-600 font-medium mt-0.5 leading-none">
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          !overviewError && <p className="text-xs text-gray-400 italic text-center py-6">No chapter data available.</p>
        )}
      </div>
    </div>
  );
}

export default ChapterOverview;