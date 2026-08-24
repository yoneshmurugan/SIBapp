import React, { useState, useEffect } from 'react';
import { X, History, Trophy, Medal, Loader2, ChevronDown, ChevronRight, Crown, Calendar, Target, TrendingUp, UserRound } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import clsx from 'clsx';

export default function PastLeadersModal({ onClose }) {
  const { data, loading, error } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/gamification/past-leaders`,
    { method: "GET", credentials: "include" }
  );

  const [expandedYear, setExpandedYear] = useState(null);
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    if (data && data.length > 0 && !expandedYear) {
      setExpandedYear(data[0].year);
      if (data[0].months && data[0].months.length > 0) {
        setExpandedMonth(data[0].months[0].month);
      }
    }
  }, [data]);

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getBadgeDetails = (type) => {
    switch (type) {
        case 'month_winner': return { label: 'Month Winner', icon: <Crown className="w-5 h-5 text-amber-400 drop-shadow-md" fill="currentColor" />, color: 'text-amber-500' };
        case 'runner_up': return { label: 'Runner Up', icon: <Medal className="w-5 h-5 text-gray-300 drop-shadow-md" fill="currentColor" />, color: 'text-gray-300' };
        case 'full_attendance': return { label: 'Full Attendance', icon: <Calendar className="w-5 h-5 text-blue-400 drop-shadow-md" />, color: 'text-blue-400' };
        case 'highest_referral': return { label: 'Highest Referrals', icon: <Target className="w-5 h-5 text-emerald-400 drop-shadow-md" />, color: 'text-emerald-400' };
        case 'highest_tyb': return { label: 'Highest TYB', icon: <TrendingUp className="w-5 h-5 text-purple-400 drop-shadow-md" />, color: 'text-purple-400' };
        case 'highest_m2m': return { label: 'Highest M2M', icon: <UserRound className="w-5 h-5 text-rose-400 drop-shadow-md" />, color: 'text-rose-400' };
        default: return { label: 'Winner', icon: <Medal className="w-5 h-5 text-gray-400" />, color: 'text-gray-400' };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#030712]/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-gray-900/90 border border-gray-800 rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800/60 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <History className="text-amber-500 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Past Monthly Leaders</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-gray-400 font-medium">Loading history...</p>
            </div>
          ) : error || !data ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-400 font-medium text-center">Failed to load past leaders.</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-300">No Past Leaders Yet</h3>
              <p className="text-gray-500 mt-2 max-w-sm">When the month ends, the winners will be recorded here forever.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.map((yearData) => (
                <div key={yearData.year} className="bg-gray-800/30 rounded-2xl border border-gray-700/30 overflow-hidden">
                  
                  {/* Year Header */}
                  <button 
                    className="w-full flex items-center justify-between px-6 py-4 bg-gray-800/50 hover:bg-gray-800/80 transition-colors"
                    onClick={() => {
                        setExpandedYear(expandedYear === yearData.year ? null : yearData.year);
                        if (expandedYear !== yearData.year && yearData.months.length > 0) {
                            setExpandedMonth(yearData.months[0].month);
                        }
                    }}
                  >
                    <span className="text-xl font-black text-gray-200">{yearData.year}</span>
                    {expandedYear === yearData.year ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Year Content (Months) */}
                  <div className={clsx(
                    "grid gap-4 transition-all duration-300 ease-in-out bg-gray-900/20",
                    expandedYear === yearData.year ? "grid-rows-[1fr] opacity-100 p-4 sm:p-6" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden flex flex-col gap-4">
                      {yearData.months.map((monthData) => (
                        <div key={monthData.month} className="bg-gray-800/50 rounded-xl border border-gray-700/30 overflow-hidden">
                            {/* Month Header (Accordion) */}
                            <button 
                                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-700/30 transition-colors"
                                onClick={() => setExpandedMonth(expandedMonth === monthData.month ? null : monthData.month)}
                            >
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    {monthNames[monthData.month]}
                                </h4>
                                {expandedMonth === monthData.month ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {/* Month Content (Winners List) */}
                            <div className={clsx(
                                "grid transition-all duration-300 ease-in-out",
                                expandedMonth === monthData.month ? "grid-rows-[1fr] opacity-100 p-4 border-t border-gray-700/30" : "grid-rows-[0fr] opacity-0"
                            )}>
                                <div className="overflow-hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {monthData.winners.map((winner, idx) => {
                                        const badge = getBadgeDetails(winner.badge_type);
                                        return (
                                            <div key={idx} className="flex items-center gap-4 bg-gray-900/60 p-3 rounded-2xl border border-gray-700/50 hover:border-amber-500/30 transition-colors">
                                                {/* Avatar */}
                                                <div className="relative">
                                                <img src={winner.avatar} alt={winner.name} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                                                <div className="absolute -bottom-1 -right-1">
                                                    {badge.icon}
                                                </div>
                                                </div>
                                                {/* Info */}
                                                <div className="flex flex-col min-w-0">
                                                <span className="text-gray-100 font-bold text-sm truncate">{winner.name}</span>
                                                <span className={clsx("text-xs font-semibold uppercase tracking-wider", badge.color)}>
                                                    {badge.label}
                                                </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
