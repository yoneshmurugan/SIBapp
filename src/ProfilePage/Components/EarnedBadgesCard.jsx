import React, { useMemo } from 'react';
import useFetch from "../../hooks/useFetch";
import { Award, Trophy, Star, Target, Crown, Calendar } from 'lucide-react';
import clsx from 'clsx';

export default function EarnedBadgesCard() {
  const { data: userBadgesData, loading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/gamification/my-badges`,
    { method: "GET", credentials: "include" }
  );

  const badges = useMemo(() => {
    if (!userBadgesData || userBadgesData.error) return [];
    return userBadgesData;
  }, [userBadgesData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full p-5 flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!badges || badges.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Award className="text-amber-500" size={18} />
          My Earned Badges
        </h3>
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
          {badges.length} Badges
        </span>
      </div>
      <div className="p-5">
        <div className="flex flex-col gap-3">
          {badges.map((badge, index) => {
            let colors, icon, subtitle, label;
            if (badge.badge_type === 'highest_referral') {
              colors = "bg-blue-50 text-blue-500 border-blue-200";
              icon = <Target size={16} />;
              subtitle = "Top Referrer";
              label = "Highest Referrals";
            } else if (badge.badge_type === 'highest_m2m') {
              colors = "bg-orange-50 text-orange-500 border-orange-200";
              icon = <Star size={16} />;
              subtitle = "Top Networker";
              label = "Highest M2M";
            } else if (badge.badge_type === 'highest_tyb') {
              colors = "bg-emerald-50 text-emerald-500 border-emerald-200";
              icon = <Award size={16} />;
              subtitle = "Top Giver";
              label = "Highest TYB";
            } else if (badge.badge_type === 'perfect_attendance' || badge.badge_type === 'full_attendance') {
              colors = "bg-purple-50 text-purple-500 border-purple-200";
              icon = <Calendar size={16} />;
              subtitle = "100%";
              label = "Full Attendance";
            } else if (badge.badge_type === 'month_winner') {
              colors = "bg-amber-50 text-amber-500 border-amber-200";
              icon = <Crown size={16} />;
              subtitle = "1st Place";
              label = "Month Winner";
            } else if (badge.badge_type === 'runner_up') {
              colors = "bg-gray-100 text-gray-500 border-gray-300";
              icon = <Award size={16} />;
              subtitle = "2nd Place";
              label = "Runner Up";
            } else {
              colors = "bg-gray-50 text-gray-500 border-gray-200";
              icon = <Award size={16} />;
              subtitle = "Achiever";
              label = badge.badge_type;
            }

            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const monthName = badge.month && badge.year 
              ? `${monthNames[badge.month - 1]} ${badge.year}` 
              : new Date(badge.awarded_at).toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase();

            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center border", colors)}>
                    {icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">{label}</span>
                    <span className="text-xs text-gray-500 font-medium">{subtitle}</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {monthName}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
