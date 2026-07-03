import { Cake, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useState } from 'react';
import useFetch from '../hooks/useFetch';

export default function WishCard({ memberName, profileImage, type, date, chapterName, profileId, userId, index = 0 }) {
  const isBirthday = type === 'birthday';
  const Icon = isBirthday ? Cake : Heart;

  const [status, setStatus] = useState('idle');

  const { data: profileData } = useFetch(
    profileId ? `${import.meta.env.VITE_BACKEND_SERVER}/public/getprofilebyid/${profileId}?user=${userId || ''}` : null
  );

  let years = null;
  if (profileData && !profileData.message) {
    if (isBirthday && profileData.dob) {
      const birthYear = new Date(profileData.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      years = currentYear - birthYear;
    } else if (!isBirthday && profileData.wedding_date) {
      const weddingYear = new Date(profileData.wedding_date).getFullYear();
      const currentYear = new Date().getFullYear();
      years = currentYear - weddingYear;
    }
  }

  const getOrdinalSuffix = (n) => {
    if (!n) return '';
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const avatarUrl = profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=random&size=256&bold=true`;

  const linkTarget = profileId ? `/profile/${profileId}?user=${userId || ''}` : '#';

  const handleSendWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (status !== 'idle' && status !== 'error') return;
    
    setStatus('loading');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/notification/send-personal-wish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          receiverId: userId,
          celebrationType: isBirthday ? 'birthday' : 'wedding anniversary'
        })
      });
      
      if (response.status === 429) {
        setStatus('alreadysent');
        return;
      }
      
      if (!response.ok) throw new Error('Failed to send wish');
      
      setStatus('success');
    } catch (error) {
      console.error('Error sending wish:', error);
      setStatus('error');
    }
  };

  return (
    <Link
      to={linkTarget}
      className="relative group w-full max-w-sm mx-auto block cursor-pointer"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Outer glow ring (Optimized for mobile) */}
      <div className={clsx(
        "absolute -inset-0.5 rounded-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500",
        isBirthday
          ? "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
          : "bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500"
      )} />

      <div className={clsx(
        "relative overflow-hidden rounded-3xl border transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl",
        isBirthday
          ? "bg-gradient-to-br from-[#2a1306] via-[#200d05] to-[#2a0808] border-amber-700/40"
          : "bg-gradient-to-br from-[#2a0b16] via-[#200610] to-[#2a061c] border-pink-700/40"
      )}>

        {/* Static background orbs (Optimized) */}
        <div className={clsx(
          "absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.08]",
          isBirthday ? "bg-amber-500" : "bg-pink-500"
        )} style={{ filter: 'blur(40px)' }} />
        <div className={clsx(
          "absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-[0.05]",
          isBirthday ? "bg-orange-400" : "bg-rose-400"
        )} style={{ filter: 'blur(30px)' }} />

        {/* Floating sparkle decorations */}
        <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-60 transition-opacity">
          <Sparkles size={20} className={isBirthday ? "text-amber-400" : "text-pink-400"} />
        </div>
        <div className="absolute bottom-16 right-8 opacity-20 group-hover:opacity-50 transition-opacity">
          <Sparkles size={14} className={isBirthday ? "text-orange-300" : "text-rose-300"} />
        </div>

        <div className="relative z-10 p-4 sm:p-8 flex flex-col items-center text-center">
          {/* Avatar with glowing ring (Optimized) */}
          <div className="relative mb-3 sm:mb-5">
            <div className={clsx(
              "absolute -inset-1.5 rounded-full opacity-40",
              isBirthday
                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                : "bg-gradient-to-r from-pink-400 to-rose-500"
            )} />
            <img
              src={avatarUrl}
              alt={memberName}
              className={clsx(
                "relative w-16 h-16 sm:w-28 sm:h-28 rounded-full object-cover border-4 shadow-xl",
                isBirthday ? "border-amber-400/70" : "border-pink-400/70"
              )}
            />
            <div className={clsx(
              "absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-1.5 sm:p-2.5 rounded-full text-white shadow-lg border-2 border-gray-900",
              isBirthday
                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                : "bg-gradient-to-br from-pink-500 to-rose-600"
            )}>
              <Icon className="w-3 h-3 sm:w-[18px] sm:h-[18px]" />
            </div>
          </div>

          {/* Name */}
          <h3 className={clsx(
            "text-[15px] sm:text-2xl font-extrabold bg-clip-text text-transparent leading-tight line-clamp-2",
            isBirthday
              ? "bg-gradient-to-r from-amber-200 via-yellow-100 to-orange-200"
              : "bg-gradient-to-r from-pink-200 via-rose-100 to-fuchsia-200"
          )}>
            {memberName}
          </h3>

          {/* Chapter badge */}
          <span className={clsx(
            "mt-1.5 sm:mt-2 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider border truncate max-w-[95%]",
            isBirthday
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-pink-500/15 text-pink-300 border-pink-500/30"
          )}>
            {chapterName || "SIB Chapter"}
          </span>

          {/* Event type & date */}
          <div className={clsx(
            "mt-3 sm:mt-5 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-2 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-bold border",
            isBirthday
              ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
              : "bg-pink-500/10 border-pink-500/20 text-pink-200"
          )}>
            <div className="flex items-center gap-1">
              <Icon size={12} className="animate-bounce sm:w-4 sm:h-4" />
              <span>{years ? `${getOrdinalSuffix(years)} ` : ''}{isBirthday ? 'Birthday' : 'Anniversary'}</span>
            </div>
            <span className="opacity-40 hidden sm:inline">•</span>
            <span className="text-white/80 whitespace-nowrap">{date}</span>
          </div>

          {/* Send Wishes Button */}
          {date === "Today" && (
            <button 
              onClick={handleSendWish}
              disabled={status !== 'idle'}
              className={clsx(
              "mt-6 w-full py-3.5 rounded-2xl text-sm font-extrabold text-white shadow-lg transition-all duration-300",
              "active:scale-95 flex items-center justify-center gap-2.5 uppercase tracking-wide cursor-pointer",
              status === 'idle' && (isBirthday
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:shadow-amber-500/30 hover:shadow-2xl hover:brightness-110"
                : "bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:shadow-pink-500/30 hover:shadow-2xl hover:brightness-110"),
              status === 'loading' && "bg-gray-500 opacity-80 cursor-wait",
              status === 'success' && "bg-green-500 shadow-green-500/30",
              status === 'alreadysent' && "bg-gray-700 shadow-gray-700/30 cursor-not-allowed opacity-80",
              status === 'error' && "bg-red-500"
            )}>
              {status === 'idle' && <><Sparkles size={18} /> Send Wishes ✨</>}
              {status === 'loading' && "Sending..."}
              {status === 'success' && "Wishes Sent 💖"}
              {status === 'alreadysent' && "Already Sent Today ✓"}
              {status === 'error' && "Failed, Retry?"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
