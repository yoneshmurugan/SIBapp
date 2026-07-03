import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trophy, Medal, Crown, Loader2, Info, X, Star, Target, Calendar, UserRound, ChevronRight, Award, Sparkles, Flame, TrendingUp, Zap } from 'lucide-react';
import Header from './Header';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

/* ═══════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND SYSTEM
   ═══════════════════════════════════════════════════════════════ */

function AnimatedBackground() {
  const stars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dur: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="lb-orb lb-orb-1" />
      <div className="lb-orb lb-orb-2" />
      <div className="lb-orb lb-orb-3" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 lb-grid-pattern opacity-[0.02]" />

      {/* Twinkling stars */}
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-amber-300"
          style={{
            width: s.size, height: s.size,
            left: `${s.x}%`, top: `${s.y}%`,
            animation: `lb-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */

function AnimatedNumber({ value, duration = 1200, className = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) { setDisplay(0); return; }
    const stepTime = Math.max(Math.floor(duration / end), 10);
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration / stepTime));
      if (start >= end) { start = end; clearInterval(timer); }
      setDisplay(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className={className} ref={ref}>{display.toLocaleString()}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   MONTH RESET COUNTDOWN
   ═══════════════════════════════════════════════════════════════ */

function MonthResetCountdown() {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calcTimeLeft = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = nextMonth - now;
      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        });
      }
    };
    calcTimeLeft();
    const timer = setInterval(calcTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center mt-6 mb-2">
      <div className="flex flex-col items-center gap-2.5">
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Calendar size={14} className="text-amber-500" /> Time Left to Claim the #1 Spot
        </span>
        <div className="flex gap-2 text-amber-500 font-black font-mono mt-1">
          <div className="flex flex-col items-center bg-gray-900/80 border border-gray-700/50 rounded-xl px-4 py-3 min-w-[64px] shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
            <span className="text-3xl sm:text-4xl leading-none">{timeLeft.d}</span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mt-1.5">Days</span>
          </div>
          <span className="text-gray-700 text-2xl sm:text-3xl font-bold self-start mt-2 animate-pulse">:</span>
          <div className="flex flex-col items-center bg-gray-900/80 border border-gray-700/50 rounded-xl px-4 py-3 min-w-[64px] shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
            <span className="text-3xl sm:text-4xl leading-none">{timeLeft.h.toString().padStart(2, '0')}</span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mt-1.5">Hrs</span>
          </div>
          <span className="text-gray-700 text-2xl sm:text-3xl font-bold self-start mt-2 animate-pulse">:</span>
          <div className="flex flex-col items-center bg-gray-900/80 border border-gray-700/50 rounded-xl px-4 py-3 min-w-[64px] shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
            <span className="text-3xl sm:text-4xl leading-none">{timeLeft.m.toString().padStart(2, '0')}</span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mt-1.5">Min</span>
          </div>
          <span className="text-gray-700 text-2xl sm:text-3xl font-bold self-start mt-2 animate-pulse">:</span>
          <div className="flex flex-col items-center bg-gray-900/80 border border-gray-700/50 rounded-xl px-4 py-3 min-w-[64px] shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
            <span className="text-3xl sm:text-4xl leading-none">{timeLeft.s.toString().padStart(2, '0')}</span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mt-1.5">Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PODIUM — 3D-STYLE TOP 3
   ═══════════════════════════════════════════════════════════════ */

function Podium({ top3, onUserClick, onBadgeClick }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  const configs = [
    {
      rank: 2, user: top3[1], delay: '200ms',
      avatarSize: 'w-20 h-20 sm:w-24 sm:h-24',
      pillarH: 'h-[160px] sm:h-[190px]',
      pillarBg: 'from-gray-800 to-gray-900',
      ringColor: 'from-gray-400 to-gray-700',
      pillarBorder: 'border-gray-500/30',
      glowColor: 'bg-gray-400',
      accentText: 'text-gray-300',
      medalBg: 'from-gray-300 to-gray-500',
      icon: <Medal size={14} className="text-gray-900" />,
      rankLabel: '2nd',
    },
    {
      rank: 1, user: top3[0], delay: '0ms',
      avatarSize: 'w-28 h-28 sm:w-36 sm:h-36',
      pillarH: 'h-[240px] sm:h-[280px]',
      pillarBg: 'from-amber-700/80 to-amber-950',
      ringColor: 'from-amber-400 to-amber-600',
      pillarBorder: 'border-amber-500/40',
      glowColor: 'bg-amber-500',
      accentText: 'text-amber-400',
      medalBg: 'from-amber-300 to-amber-600',
      icon: <Crown size={22} className="text-amber-950" />,
      rankLabel: '1st',
    },
    {
      rank: 3, user: top3[2], delay: '400ms',
      avatarSize: 'w-16 h-16 sm:w-20 sm:h-20',
      pillarH: 'h-[140px] sm:h-[160px]',
      pillarBg: 'from-orange-800/80 to-orange-950',
      ringColor: 'from-orange-500 to-orange-800',
      pillarBorder: 'border-orange-600/40',
      glowColor: 'bg-orange-500',
      accentText: 'text-orange-400',
      medalBg: 'from-orange-400 to-orange-700',
      icon: <Medal size={16} className="text-white" />,
      rankLabel: '3rd',
    },
  ];

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-10 mt-16 mb-10 px-2">
      {configs.map(c => {
        if (!c.user) return <div key={c.rank} className="w-32 sm:w-44" />;
        return (
          <div
            key={c.rank}
            onClick={() => onUserClick(c.user)}
            className={clsx(
              "flex flex-col items-center justify-end cursor-pointer group transition-all duration-700 ease-out",
              revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            )}
            style={{ transitionDelay: c.delay }}
          >
            {/* Avatar block */}
            <div className="relative mb-[-20px] z-10 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
              {/* Floating crown/medal */}
              <div className={clsx(
                "absolute -top-5 left-1/2 -translate-x-1/2 p-1.5 rounded-full border-2 border-gray-900/80 z-20 shadow-xl bg-gradient-to-br",
                c.medalBg
              )}>
                {c.icon}
              </div>

              {/* Pulsing glow ring for #1 */}
              {c.rank === 1 && (
                <>
                  <div className="absolute -inset-4 rounded-full border-2 border-amber-400/20 lb-pulse-ring" />
                  <div className="absolute -inset-7 rounded-full border border-amber-400/10 lb-pulse-ring" style={{ animationDelay: '0.5s' }} />
                </>
              )}

              {/* Gradient ring */}
              <div className={clsx("rounded-full p-[3px] bg-gradient-to-b shadow-2xl", c.ringColor)}>
                <div className={clsx("absolute inset-0 rounded-full blur-xl opacity-40", c.glowColor)} />
                <img
                  src={c.user.avatar}
                  alt={c.user.name}
                  className={clsx(
                    "relative rounded-full object-cover border-[3px] border-gray-900",
                    c.avatarSize
                  )}
                />
              </div>
            </div>

            {/* Pillar */}
            <div className={clsx(
              "w-32 sm:w-44 rounded-t-3xl border-t-2 border-x relative overflow-hidden flex flex-col items-center pt-10 sm:pt-14 backdrop-blur-sm",
              c.pillarH, c.pillarBorder,
              `bg-gradient-to-b ${c.pillarBg}`
            )}>
              {/* Shimmer effect */}
              <div className="absolute inset-0 lb-pillar-shimmer" />
              {/* Light beam at top */}
              <div className={clsx("absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-16 blur-2xl opacity-20", c.glowColor)} />

              <span className={clsx("relative z-10 font-black drop-shadow-lg opacity-80 text-sm sm:text-base uppercase tracking-[0.25em]", c.accentText)}>
                {c.rankLabel}
              </span>
              <p className="relative z-10 text-white font-bold text-sm sm:text-lg line-clamp-1 mt-3 px-2 text-center">
                {c.user.name}
              </p>
              
              {c.user.badges && c.user.badges.length > 0 && (() => {
                const grouped = Object.entries(c.user.badges.reduce((acc,curr) => { acc[curr] = (acc[curr] || 0)+1; return acc; }, {})).map(([type, count]) => ({ type, count }));
                return (
                  <div 
                    className="relative z-10 flex items-center -space-x-2 mt-1 cursor-pointer hover:scale-110 transition-transform"
                    onClick={(e) => { e.stopPropagation(); onBadgeClick && onBadgeClick(c.user); }}
                  >
                    {grouped.slice(0, 3).map((badge, idx) => (
                      <div key={idx} className="relative z-10">
                        <img
                          src={`/assets/badges/${badge.type}.png`}
                          alt={badge.type}
                          className="w-7 h-7 object-contain drop-shadow-md rounded-full border border-gray-700/50 bg-gray-900"
                          title={badge.type.replace(/_/g, ' ')}
                        />
                        {badge.count > 1 && (
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 flex items-center justify-center rounded-full border border-gray-900 shadow-sm px-1">
                            {badge.count}
                          </div>
                        )}
                      </div>
                    ))}
                    {grouped.length > 3 && (
                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700/50 z-10 text-[9px] font-black text-amber-400">
                        +{grouped.length - 3}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className={clsx("relative z-10 flex items-center gap-1 mt-1.5 px-3 py-1 rounded-full bg-black/30 border border-white/10")}>
                <Zap size={10} className={c.accentText} />
                <AnimatedNumber value={c.user.points} className={clsx("text-xs font-black", c.accentText)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RULES MODAL
   ═══════════════════════════════════════════════════════════════ */

function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div className="lb-modal bg-gray-900/95 border border-gray-700/50 rounded-3xl w-full max-w-md shadow-2xl shadow-amber-500/10 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800/80 bg-gradient-to-r from-amber-950/30 to-transparent">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg"><Info size={18} className="text-amber-500" /></div>
            Leaderboard Rules
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-gray-300 text-sm space-y-2 bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
            <p>
              Earn points by participating in chapter activities. The members with the highest points will be featured on the leaderboard! The leaderboard resets at the beginning of every month, giving everyone a fresh chance to win.
            </p>
            <p className="text-gray-400 text-xs italic leading-relaxed">
              சங்க நிகழ்வுகளில் பங்கேற்பதன் மூலம் புள்ளிகளைப் பெறுங்கள். அதிக புள்ளிகள் பெறும் உறுப்பினர்கள் லீடர்போர்டில் இடம்பெறுவார்கள்! ஒவ்வொரு மாதத்தின் தொடக்கத்திலும் லீடர்போர்டு மீட்டமைக்கப்படும், எனவே அனைவருக்கும் வெல்ல புதிய வாய்ப்பு கிடைக்கும்.
            </p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Attendance', pts: 50, icon: '📅', desc: 'Per meeting attended' },
              { label: 'TYB (Business Given)', pts: 30, icon: '💼', desc: 'Per TYB slip given' },
              { label: 'Referral Given', pts: 20, icon: '🤝', desc: 'Per referral given' },
              { label: '1-to-1 Meeting (M2M)', pts: 10, icon: '👥', desc: 'Per M2M completed' },
            ].map((r, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-700/30 bg-gray-800/20 hover:bg-gray-800/40 transition-all duration-200 lb-modal-item" style={{ animationDelay: `${i * 80 + 200}ms` }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{r.icon}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{r.label}</p>
                    <p className="text-gray-500 text-[10px]">{r.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Zap size={10} className="text-amber-400" />
                  <span className="text-amber-400 font-black text-xs">{r.pts}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] duration-200">
            Got it / புரிந்தது ✨
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BADGES MODAL
   ═══════════════════════════════════════════════════════════════ */

const BADGES = [
  { type: 'month_winner', label: 'Month Winner', description: 'The ultimate champion! Highest total points this month across all categories.', image: '/badges/month_winner.png', color: 'from-yellow-400 to-amber-600', borderColor: 'border-yellow-500/40', bgColor: 'bg-yellow-500/5' },
  { type: 'runner_up', label: 'Runner Up', description: 'Almost at the top! Second highest total points this month. Keep pushing!', image: '/badges/runner_up.png', color: 'from-gray-300 to-gray-500', borderColor: 'border-gray-400/40', bgColor: 'bg-gray-400/5' },
  { type: 'full_attendance', label: 'Full Attendance', description: 'Attended every single meeting this month. Consistency is the key!', image: '/badges/full_attendance.png', color: 'from-amber-500 to-yellow-600', borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/5' },
  { type: 'highest_referral', label: 'Highest Referrals', description: 'Gave the most referrals this month. A true connector!', image: '/badges/highest_referral.png', color: 'from-emerald-500 to-green-600', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/5' },
  { type: 'highest_tyb', label: 'Highest TYB', description: 'Gave the most business this month. A powerhouse of giving!', image: '/badges/highest_tyb.png', color: 'from-purple-500 to-violet-600', borderColor: 'border-purple-500/30', bgColor: 'bg-purple-500/5' },
  { type: 'highest_m2m', label: 'Highest M2M', description: 'Completed the most 1-to-1 meetings this month. Deep relationships!', image: '/badges/highest_m2m.png', color: 'from-cyan-500 to-teal-600', borderColor: 'border-cyan-500/30', bgColor: 'bg-cyan-500/5' },
];

function BadgesModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div className="lb-modal bg-gray-900/95 border border-gray-700/50 rounded-3xl w-full max-w-md shadow-2xl shadow-amber-500/10 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800/80 bg-gradient-to-r from-amber-950/30 to-transparent">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg"><Award size={18} className="text-amber-500" /></div>
            Monthly Badges
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <p className="text-gray-400 text-sm mb-1">Special badges awarded to top performers each month.</p>
          {BADGES.map((badge, i) => (
            <div key={badge.type} className={`flex items-center gap-4 p-3.5 rounded-xl border ${badge.borderColor} ${badge.bgColor} hover:scale-[1.02] transition-all duration-300 lb-modal-item`} style={{ animationDelay: `${i * 80 + 150}ms` }}>
              <img src={badge.image} alt={badge.label} className="w-14 h-14 rounded-xl object-cover shadow-lg flex-shrink-0" />
              <div className="min-w-0">
                <p className={`font-black text-sm bg-clip-text text-transparent bg-gradient-to-r ${badge.color}`}>{badge.label}</p>
                <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">{badge.description}</p>
              </div>
            </div>
          ))}
          <button onClick={onClose} className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] duration-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USER EARNED BADGES MODAL
   ═══════════════════════════════════════════════════════════════ */

function UserEarnedBadgesModal({ user, onClose }) {
  if (!user) return null;
  const groupedBadges = Object.entries((user.badges || []).reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {})).map(([type, count]) => ({ type, count }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div className="lb-modal bg-gray-900/95 border border-gray-700/50 rounded-3xl w-full max-w-md shadow-2xl shadow-amber-500/10 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800/80 bg-gradient-to-r from-amber-950/30 to-transparent">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg"><Award size={18} className="text-amber-500" /></div>
            {user.name}'s Badges
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto max-h-[60vh]">
          {groupedBadges.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No badges earned yet.</p>
          ) : (
            groupedBadges.map((badgeItem, i) => {
              const badgeDef = BADGES.find(b => b.type === badgeItem.type) || { label: badgeItem.type, description: 'Earned badge', color: 'from-gray-400 to-gray-500', borderColor: 'border-gray-500/30', bgColor: 'bg-gray-500/10', image: `/assets/badges/${badgeItem.type}.png` };
              return (
                <div key={badgeItem.type} className={`flex items-center gap-4 p-3.5 rounded-xl border ${badgeDef.borderColor} ${badgeDef.bgColor} hover:scale-[1.02] transition-all duration-300 lb-modal-item`} style={{ animationDelay: `${i * 80 + 150}ms` }}>
                  <div className="relative">
                    <img src={badgeDef.image} alt={badgeDef.label} className="w-14 h-14 rounded-xl object-cover shadow-lg flex-shrink-0" />
                    {badgeItem.count > 1 && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-gray-900 shadow-md px-1">
                        {badgeItem.count}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-black text-sm bg-clip-text text-transparent bg-gradient-to-r ${badgeDef.color}`}>{badgeDef.label}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">{badgeDef.description}</p>
                  </div>
                </div>
              );
            })
          )}
          <button onClick={onClose} className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] duration-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BREAKDOWN MODAL
   ═══════════════════════════════════════════════════════════════ */

function BreakdownModal({ user, onClose }) {
  if (!user) return null;
  const stats = user.stats || {};
  const items = [
    { label: 'Attendance', count: stats.attendance || 0, multi: 50, pts: (stats.attendance || 0) * 50, emoji: '📅', color: 'from-purple-500 to-purple-700' },
    { label: 'TYB (Business)', count: stats.tyfcb || 0, multi: 30, pts: (stats.tyfcb || 0) * 30, emoji: '💼', color: 'from-green-500 to-green-700' },
    { label: 'Referrals', count: stats.referrals || 0, multi: 20, pts: (stats.referrals || 0) * 20, emoji: '🤝', color: 'from-blue-500 to-blue-700' },
    { label: '1-to-1 (M2M)', count: stats.m2m || 0, multi: 10, pts: (stats.m2m || 0) * 10, emoji: '👥', color: 'from-orange-500 to-orange-700' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div className="lb-modal bg-gray-900/95 border border-gray-700/50 rounded-3xl w-full max-w-md shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative p-6 pt-8 flex flex-col items-center border-b border-gray-800/80 bg-gradient-to-b from-gray-800/50 to-transparent">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300 z-10">
            <X size={18} />
          </button>
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-amber-500/20 blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
            <img src={user.avatar} alt={user.name} className="relative w-20 h-20 rounded-full border-4 border-gray-700 shadow-xl object-cover" />
          </div>
          <h3 className="text-xl font-black text-white mt-3">{user.name}</h3>
          <p className="text-gray-400 text-sm">{user.company}</p>
          <div className="flex items-center gap-2 bg-amber-500/10 px-5 py-2.5 rounded-full border border-amber-500/20 mt-3">
            <Zap size={14} className="text-amber-500" />
            <AnimatedNumber value={user.points} className="text-amber-400 font-black text-lg" />
            <span className="text-amber-400/60 text-xs font-bold">PTS</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="p-5 space-y-2.5 overflow-y-auto max-h-[50vh]">
          <h4 className="text-gray-500 font-bold text-xs uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
            <Sparkles size={12} className="text-amber-500" /> Points Breakdown
          </h4>
          {items.map((item, i) => {
            const pct = user.points > 0 ? (item.pts / user.points) * 100 : 0;
            return (
              <div key={item.label} className="bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/50 lb-modal-item" style={{ animationDelay: `${i * 80 + 100}ms` }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{item.label}</p>
                      <p className="text-gray-500 text-[10px]">{item.count} × {item.multi} pts</p>
                    </div>
                  </div>
                  <span className="text-white font-black">{item.pts}</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${item.color} lb-bar-fill`} style={{ '--bar-width': `${pct}%`, animationDelay: `${i * 150 + 500}ms` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 pt-2">
          <Link to={`/profile/${user.id}?user=${user.user_id}`} className="w-full py-3.5 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700 group hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 duration-300">
            <UserRound size={16} />
            View Full Profile
            <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LEADERBOARD PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function LeaderboardPage() {
  const [showRules, setShowRules] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [selectedUserForBadges, setSelectedUserForBadges] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [headerReady, setHeaderReady] = useState(false);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    setShowRules(true);
    const t = setTimeout(() => setHeaderReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  const { data: rawLeaderboard, loading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/gamification/leaderboard`,
    { method: "GET", credentials: "include" }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 w-20 h-20 bg-amber-500/30 blur-3xl rounded-full animate-pulse" />
          <div className="relative p-5 bg-gray-900/60 rounded-2xl border border-amber-500/20 backdrop-blur">
            <Trophy size={40} className="text-amber-400 lb-loader-icon" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-300 text-sm font-bold tracking-wide">Loading Leaderboard</p>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 lb-dot-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-amber-500 lb-dot-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-amber-500 lb-dot-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  let leaderboard = (rawLeaderboard || [])
    .filter(u => u.points > 0)
    .sort((a, b) => b.points - a.points)
    .map((u, i) => ({ ...u, rank: i + 1 }));



  const isEmpty = !leaderboard || leaderboard.length === 0;
  const top3 = isEmpty ? [] : leaderboard.slice(0, 3);
  const runnersUp = isEmpty ? [] : leaderboard.slice(3, 10);

  return (
    <div 
      className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <AnimatedBackground />

      {/* HUGE FIXED BACKGROUND MONTH */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="text-[28vw] font-black text-amber-500/[0.1] uppercase tracking-tighter whitespace-nowrap transform -rotate-6 scale-125">
          {currentMonth}
        </span>
      </div>

      <div 
        className="fixed left-0 w-full z-40 bg-transparent transition-all duration-300"
        style={{ top: 'calc(10px + env(safe-area-inset-top, 0px))' }}
      >
        <Header />
      </div>

      <main className="mt-[100px] flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10 pb-24">

        {/* ═══ HERO HEADER ═══ */}
        <div className={clsx(
          "text-center mb-6 relative transition-all duration-1000 ease-out",
          headerReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>


          {/* Title */}
          <div className="relative flex justify-center items-center py-6 mt-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight relative z-10">
              <span className="lb-gradient-text">Top Networkers</span>
            </h1>
          </div>

          <p className="mt-4 text-gray-400 font-medium text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Recognizing the most active members of the month
          </p>

          <MonthResetCountdown />
        </div>

        {/* Action buttons - TOP RIGHT OF MAIN CONTENT */}
        <div className="absolute top-0 right-4 sm:right-6 hidden sm:flex flex-col sm:flex-row items-end sm:items-center gap-3 z-50">
          {[
            { label: 'Badges', icon: <Award size={14} />, onClick: () => setShowBadges(true) },
            { label: 'Rules', icon: <Info size={14} />, onClick: () => setShowRules(true) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} className="lb-pill-btn group">
              <span className="text-amber-500 group-hover:rotate-12 transition-transform duration-300">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
        
        {/* Mobile Action Buttons */}
        <div className="sm:hidden flex items-center justify-center gap-3 mb-6 relative z-50">
          {[
            { label: 'Badges', icon: <Award size={14} />, onClick: () => setShowBadges(true) },
            { label: 'Rules', icon: <Info size={14} />, onClick: () => setShowRules(true) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} className="lb-pill-btn group">
              <span className="text-amber-500 group-hover:rotate-12 transition-transform duration-300">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>



        {/* ═══ CONTENT ═══ */}
        {isEmpty ? (
          <div className={clsx(
            "mt-12 flex flex-col items-center justify-center text-center p-10 bg-gray-900/40 rounded-3xl border border-gray-800/60 shadow-xl backdrop-blur-sm transition-all duration-700",
            headerReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )} style={{ transitionDelay: '400ms' }}>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gray-600/10 blur-2xl rounded-full" />
              <Trophy size={72} className="relative text-gray-700" />
            </div>
            <h2 className="text-2xl font-black text-gray-300 mb-3">The Month Just Started!</h2>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              No points earned yet. Start attending meetings, giving referrals, and completing M2Ms to claim the #1 spot!
            </p>
          </div>
        ) : (
          <>
            {/* ═══ PODIUM ═══ */}
            <Podium top3={top3} onUserClick={setSelectedUser} onBadgeClick={setSelectedUserForBadges} />

            {/* ═══ DIVIDER ═══ */}
            <div className="flex items-center gap-4 my-8 px-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <TrendingUp size={12} className="text-amber-500" /> Rankings
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>

            {/* ═══ RUNNERS UP LIST ═══ */}
            <div className="space-y-3">
              {runnersUp.map((user, i) => (
                <div
                  onClick={() => setSelectedUser(user)}
                  key={user.id}
                  className="lb-row group"
                  style={{ animationDelay: `${(i + 4) * 100}ms` }}
                >
                  {/* Hover shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out pointer-events-none" />

                  {/* Rank */}
                  <div className="lb-rank-diamond shrink-0">
                    <div className="lb-rank-diamond-bg group-hover:rotate-[135deg] group-hover:bg-amber-500/15 group-hover:border-amber-500/40" />
                    <span className="relative z-10 font-black text-gray-500 group-hover:text-amber-400 transition-colors duration-500 text-base sm:text-xl">
                      {user.rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 bg-amber-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-700/80 group-hover:border-amber-400/80 transition-all duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 ml-2">
                    <h4 className="text-gray-200 font-bold text-base sm:text-lg truncate group-hover:text-amber-400 transition-colors duration-300">
                      {user.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-gray-500 text-sm truncate">{user.company}</p>
                      {user.badges && user.badges.length > 0 && (() => {
                        const grouped = Object.entries(user.badges.reduce((acc,curr) => { acc[curr] = (acc[curr] || 0)+1; return acc; }, {})).map(([type, count]) => ({ type, count }));
                        return (
                          <div 
                            className="flex items-center -space-x-3 cursor-pointer hover:scale-105 transition-transform"
                            onClick={(e) => { e.stopPropagation(); setSelectedUserForBadges(user); }}
                          >
                            {grouped.slice(0, 4).map((badge, idx) => (
                              <div key={idx} className="relative z-10">
                                <img
                                  src={`/assets/badges/${badge.type}.png`}
                                  alt={badge.type}
                                  className="w-14 h-14 object-contain drop-shadow-md rounded-full border-[1.5px] border-gray-800 bg-gray-900"
                                  title={badge.type.replace(/_/g, ' ')}
                                />
                                {badge.count > 1 && (
                                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[11px] font-black min-w-[20px] h-[20px] flex items-center justify-center rounded-full border border-gray-900 shadow-sm px-1">
                                    {badge.count}
                                  </div>
                                )}
                              </div>
                            ))}
                            {grouped.length > 4 && (
                              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-800 border-[1.5px] border-gray-700 z-10 text-[13px] font-black text-amber-400">
                                +{grouped.length - 4}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-3 shrink-0 pl-3">
                    <div className="text-right">
                      <span className="text-amber-400 font-black text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300 origin-right inline-block">
                        {user.points.toLocaleString()}
                      </span>
                      <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-[0.2em]">pts</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-700 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <RulesModal 
        isOpen={showRules} 
        onClose={() => {
          setShowRules(false);
          if (isFirstLoad) {
            setShowBadges(true);
            setIsFirstLoad(false);
          }
        }} 
      />
      <BadgesModal isOpen={showBadges} onClose={() => setShowBadges(false)} />
      <UserEarnedBadgesModal user={selectedUserForBadges} onClose={() => setSelectedUserForBadges(null)} />
      <BreakdownModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* ═══════════════════════════════════════════════════════════
          INLINE STYLES — all animations & utility classes
         ═══════════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Background orbs ── */
        .lb-orb { position: absolute; border-radius: 9999px; filter: blur(120px); pointer-events: none; }
        .lb-orb-1 { width: 500px; height: 500px; top: -100px; left: -100px; background: radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%); animation: lb-drift-1 22s ease-in-out infinite; }
        .lb-orb-2 { width: 400px; height: 400px; bottom: -50px; right: -80px; background: radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%); animation: lb-drift-2 28s ease-in-out infinite; }
        .lb-orb-3 { width: 350px; height: 350px; top: 40%; left: 50%; background: radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%); animation: lb-drift-3 18s ease-in-out infinite; }

        @keyframes lb-drift-1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(60px,-40px); } }
        @keyframes lb-drift-2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-50px,40px); } }
        @keyframes lb-drift-3 { 0%,100% { transform: translate(-50%,-50%); } 50% { transform: translate(calc(-50% + 40px), calc(-50% - 30px)); } }

        /* ── Grid pattern ── */
        .lb-grid-pattern { background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 60px 60px; }

        /* ── Twinkle ── */
        @keyframes lb-twinkle { 0%,100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 0.6; transform: scale(1.2); } }

        /* ── Breathe ── */
        @keyframes lb-breathe { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 1; } }
        .lb-breathe { animation: lb-breathe 4s ease-in-out infinite; }

        /* ── Gradient text ── */
        .lb-gradient-text {
          background: linear-gradient(135deg, #fbbf24, #f59e0b, #fb923c, #f59e0b, #fbbf24);
          background-size: 300% 300%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: lb-gradient-shift 5s ease infinite;
        }
        @keyframes lb-gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

        /* ── Pill button ── */
        .lb-pill-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: 9999px; font-size: 12px; font-weight: 700;
          background: rgba(31,41,55,0.8); border: 1px solid rgba(75,85,99,0.6);
          color: #d1d5db; transition: all 0.3s;
          backdrop-filter: blur(8px);
        }
        .lb-pill-btn:hover {
          background: rgba(55,65,81,0.9); color: white;
          border-color: rgba(245,158,11,0.3);
          box-shadow: 0 0 20px -5px rgba(245,158,11,0.2);
        }

        /* ── Pulse ring ── */
        @keyframes lb-pulse-ring-kf { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.3); opacity: 0; } }
        .lb-pulse-ring { animation: lb-pulse-ring-kf 2.5s ease-out infinite; }

        /* ── Pillar shimmer ── */
        .lb-pillar-shimmer { background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%); background-size: 200% 100%; animation: lb-pillar-shimmer-kf 4s ease-in-out infinite; }
        @keyframes lb-pillar-shimmer-kf { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ── Modal ── */
        .lb-modal { animation: lb-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes lb-modal-in { 0% { opacity: 0; transform: scale(0.92) translateY(24px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }

        .lb-modal-item { opacity: 0; animation: lb-modal-item-in 0.4s ease-out forwards; }
        @keyframes lb-modal-item-in { 0% { opacity: 0; transform: translateX(-10px); } 100% { opacity: 1; transform: translateX(0); } }

        /* ── Row card ── */
        .lb-row {
          position: relative; display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-radius: 18px; overflow: hidden; cursor: pointer;
          background: rgba(17,24,39,0.5); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0; transform: translateY(16px);
          animation: lb-row-in 0.5s ease-out forwards;
        }
        .lb-row:hover {
          background: rgba(31,41,55,0.6);
          border-color: rgba(245,158,11,0.25);
          box-shadow: 0 0 40px -10px rgba(245,158,11,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
          transform: translateX(4px);
        }
        @keyframes lb-row-in { to { opacity: 1; transform: translateY(0); } }

        /* ── Rank diamond ── */
        .lb-rank-diamond { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
        .lb-rank-diamond-bg {
          position: absolute; inset: 0; border-radius: 12px; transform: rotate(45deg);
          background: rgba(31,41,55,0.6); border: 1px solid rgba(75,85,99,0.3);
          transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (min-width: 640px) {
          .lb-rank-diamond { width: 50px; height: 50px; }
        }

        /* ── Bar fill ── */
        .lb-bar-fill { width: 0; animation: lb-bar-grow 1s ease-out forwards; }
        @keyframes lb-bar-grow { to { width: var(--bar-width); } }

        /* ── Loader ── */
        .lb-loader-icon { animation: lb-loader-pulse 1.5s ease-in-out infinite; }
        @keyframes lb-loader-pulse { 0%,100% { transform: scale(1) rotate(0deg); } 25% { transform: scale(1.1) rotate(-5deg); } 75% { transform: scale(0.95) rotate(5deg); } }

        .lb-dot-bounce { animation: lb-dot-bounce-kf 1.2s ease-in-out infinite; }
        @keyframes lb-dot-bounce-kf { 0%,100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-6px); opacity: 1; } }
      `}</style>
    </div>
  );
}
