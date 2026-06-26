import { useState, useEffect, useMemo } from 'react';
import { Clock, CalendarHeart, Sparkles, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CountdownSection({ nextEvent }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const targetDate = useMemo(() => {
    if (!nextEvent?.targetDate) return null;
    return new Date(nextEvent.targetDate);
  }, [nextEvent]);

  const linkTarget = nextEvent?.profileId ? `/profile/${nextEvent.profileId}?user=${nextEvent.userId || ''}` : '#';

  useEffect(() => {
    if (!targetDate) return;

    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, targetDate - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!nextEvent) return null;

  const isBirthday = nextEvent.type === 'birthday';

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <Link to={linkTarget} className="relative w-full max-w-3xl mx-auto mt-8 block cursor-pointer group">
      {/* Outer glow */}
      <div className="absolute -inset-2 rounded-[2rem] blur-2xl opacity-25 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-pulse group-hover:opacity-40 transition-opacity" />

      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-gray-900 via-indigo-950/50 to-gray-900 p-6 sm:p-14 text-center transform transition-transform group-hover:scale-[1.02]">
        {/* Animated background orbs */}
        <div className="absolute top-0 left-1/4 w-40 h-40 sm:w-60 sm:h-60 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 sm:w-48 sm:h-48 bg-purple-600/10 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-cyan-600/5 rounded-full blur-3xl" style={{ animation: 'pulse 5s ease-in-out infinite' }} />

        {/* Icon */}
        <div className="relative z-10 inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 sm:mb-6">
          <CalendarHeart size={28} className="text-indigo-400 animate-pulse sm:w-8 sm:h-8" />
        </div>

        {/* Title */}
        <h2 className="relative z-10 text-xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-cyan-200 mb-2 leading-tight">
          Next Celebration Coming Up!
        </h2>
        <p className="relative z-10 text-sm sm:text-base text-gray-400 font-medium mb-2">
          {nextEvent.memberName}'s {isBirthday ? '🎂 Birthday' : '💍 Anniversary'}
        </p>

        {/* Member preview */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 my-6 sm:my-8">
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-full blur-md opacity-50 bg-gradient-to-r from-indigo-400 to-purple-500 animate-pulse" />
            <img
              src={nextEvent.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(nextEvent.memberName)}&background=random&size=128&bold=true`}
              alt={nextEvent.memberName}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-indigo-400/50 shadow-xl"
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg sm:text-xl font-bold text-white">{nextEvent.memberName}</p>
            <p className="text-xs sm:text-sm text-indigo-300/80 font-medium">{nextEvent.chapterName || 'SIB Chapter'}</p>
          </div>
        </div>

        {/* Countdown boxes */}
        <div className="relative z-10 grid grid-cols-4 gap-2 sm:gap-5 max-w-md mx-auto mb-6">
          {units.map((unit) => (
            <div key={unit.label} className="relative group/box">
              <div className="absolute -inset-0.5 rounded-2xl blur-sm opacity-30 bg-gradient-to-b from-indigo-500 to-purple-600 group-hover/box:opacity-50 transition-opacity" />
              <div className="relative bg-gray-900/80 border border-indigo-500/20 rounded-2xl py-3 px-1 sm:py-4 sm:px-2 backdrop-blur-sm">
                <div className="text-2xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[9px] sm:text-xs font-bold text-indigo-300/70 uppercase tracking-widest mt-1">
                  {unit.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sparkle footer */}
        <div className="relative z-10 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Sparkles size={14} className="text-indigo-400/50" />
          <span>Get ready to celebrate!</span>
          <Sparkles size={14} className="text-purple-400/50" />
        </div>
      </div>
    </Link>
  );
}
