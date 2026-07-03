import React from 'react';
import { Trophy, Crown, Medal, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import useFetch from '../hooks/useFetch';

export default function LeaderboardTeaser() {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const { data: leaderboard, loading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/gamification/leaderboard`,
    { method: "GET", credentials: "include" }
  );
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Trophy size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{currentMonth} Top Networkers</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
          </div>
        </div>
        <Link 
          to="/leaderboard" 
          className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-semibold text-xs sm:text-sm flex items-center gap-1 group"
        >
          View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* List */}
      <div className="p-4 flex flex-col gap-3 min-h-[200px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        ) : (leaderboard || []).filter(u => u.points > 0).length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">The month just started!</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No points earned yet.</p>
          </div>
        ) : (
          (leaderboard || []).filter(u => u.points > 0).slice(0, 3).map((user) => (
            <div key={user.id} className="flex items-center gap-3 group cursor-pointer">
            {/* Rank Badge */}
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 relative",
              user.rank === 1 ? "bg-amber-100 border-amber-400 text-amber-600 dark:bg-amber-900/40 dark:border-amber-500/50 dark:text-amber-400" :
              user.rank === 2 ? "bg-gray-100 border-gray-400 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300" :
              "bg-orange-100 border-orange-400 text-orange-600 dark:bg-orange-900/40 dark:border-orange-700/50 dark:text-orange-400"
            )}>
              {user.rank === 1 ? <Crown size={14} /> : <Medal size={14} />}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center font-bold text-[9px]">
                {user.rank}
              </div>
            </div>

            {/* Avatar */}
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-amber-500 transition-colors" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-amber-500 transition-colors">{user.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.points.toLocaleString()} pts</p>
            </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
