import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

const INSPIRATIONAL_PHRASES = [
  "Empowering Entrepreneurs • Multiplying Growth • Building Legacy",
  "Connecting Community to Commerce with Trust & Integrity",
  "Uniting Sengunthar Leaders Across Chapters & Verticals",
  "Fostering Opportunities, Collaboration & Collective Prosperity",
];

export default function SessionLoadingScreen({
  badge = "SENGUNTHAR IN BUSINESS",
  title = "Connecting to Your Network",
  subtitle,
  hint = "Securing your session...",
  fullScreen = true,
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % INSPIRATIONAL_PHRASES.length);
        setFade(true);
      }, 350);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const displaySubtitle = subtitle || INSPIRATIONAL_PHRASES[phraseIndex];

  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-50 min-h-screen" : "w-full min-h-[400px] rounded-3xl"
      } relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-[#0B132B] to-slate-950 px-4 py-8 select-none text-white`}
      role="status"
      aria-label="Loading session"
    >
      <style>{`
        @keyframes sib-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sib-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes sib-shimmer {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(250%); }
        }
        @keyframes sib-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes sib-pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(0.98); }
          50% { opacity: 0.85; transform: scale(1.04); }
        }
        .animate-sib-spin-slow {
          animation: sib-spin-slow 12s linear infinite;
        }
        .animate-sib-spin-reverse {
          animation: sib-spin-reverse 18s linear infinite;
        }
        .animate-sib-shimmer {
          animation: sib-shimmer 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-sib-float {
          animation: sib-float 3.5s ease-in-out infinite;
        }
        .animate-sib-pulse-glow {
          animation: sib-pulse-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-sib-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Card Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        
        {/* Animated Logo Section */}
        <div className="relative mb-8 flex items-center justify-center">
          
          {/* Outermost Orbital Ring (Reverse) */}
          <div className="absolute -inset-5 rounded-full border border-dashed border-amber-500/20 animate-sib-spin-reverse pointer-events-none" />
          
          {/* Middle Radiant Rotating Ring */}
          <div className="absolute -inset-2.5 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500/40 border-b-yellow-500/20 animate-sib-spin-slow pointer-events-none" />

          {/* Golden Ambient Halo */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent blur-md animate-sib-pulse-glow pointer-events-none" />

          {/* Logo Badge Card */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900/90 border border-amber-400/40 backdrop-blur-xl shadow-[0_0_35px_rgba(245,158,11,0.25)] flex items-center justify-center p-3 animate-sib-float">
            <img
              src="/assets/logo.webp"
              alt="SIB Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-500"
              onError={(e) => {
                if (e.currentTarget.src.includes("/assets/logo.webp")) {
                  e.currentTarget.src = "/logo.webp";
                }
              }}
            />

            {/* Sparkle Floating Badge */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-amber-200/60 shadow-lg flex items-center justify-center text-slate-950">
              <Sparkles size={14} className="animate-pulse" />
            </div>
          </div>
        </div>

        {/* Brand Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] sm:text-xs font-bold tracking-widest uppercase mb-3.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>{badge}</span>
        </div>

        {/* Dynamic Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 mb-2.5">
          {title}
        </h2>

        {/* Rotating Beautiful Words / Ethos Subtitle */}
        <div className="h-12 sm:h-14 flex items-center justify-center px-4">
          <p
            className={`text-xs sm:text-sm font-medium text-amber-200/80 leading-relaxed max-w-sm transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            {displaySubtitle}
          </p>
        </div>

        {/* Sleek Golden Progress Shimmer */}
        <div className="mt-4 w-44 sm:w-56 h-1 bg-slate-800/80 rounded-full overflow-hidden relative border border-slate-700/50">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-sib-shimmer" />
        </div>

        {/* Security / Hint Footer Note */}
        <div className="mt-5 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
          <ShieldCheck size={14} className="text-amber-400 shrink-0" />
          <span>{hint}</span>
        </div>

      </div>
    </div>
  );
}
