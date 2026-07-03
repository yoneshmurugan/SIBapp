import { useMemo } from "react";
import Header from "../MainPage/Header";
import WishCard from "./WishCard";
import CountdownSection from "./CountdownSection";
import Confetti from "react-confetti-boom";
import { Gift, Sparkles, PartyPopper, Clock, Loader2 } from "lucide-react";
import useFetch from "../hooks/useFetch";

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() &&
         d.getMonth() === now.getMonth() &&
         d.getFullYear() === now.getFullYear();
}

export default function WallOfWishes() {
  const { data: allEventsData, loading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/public/upcoming-celebrations`
  );

  const allEvents = allEventsData || [];

  const todaysCelebrants = useMemo(
    () => allEvents.filter(e => isToday(e.targetDate)),
    [allEvents]
  );

  const upcomingEvents = useMemo(
    () => allEvents
      .filter(e => !isToday(e.targetDate))
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate)),
    [allEvents]
  );

  const nextEvent = upcomingEvents[0] || null;
  const hasCelebrants = todaysCelebrants.length > 0;

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full min-h-screen overflow-hidden relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundColor: '#030712'
        }}
      >
        {/* Deep dark overlay */}
        <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md z-0" />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite reverse' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">

          {/* Icon cluster */}
          <div className="flex items-end gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-900/20"
              style={{ animation: 'pulse 2.5s ease-in-out infinite' }}>
              <Gift size={22} className="text-amber-400" />
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 shadow-xl shadow-indigo-900/20"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}>
              <PartyPopper size={28} className="text-indigo-300" />
            </div>
            <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 shadow-lg shadow-pink-900/20"
              style={{ animation: 'pulse 3s ease-in-out infinite' }}>
              <Sparkles size={22} className="text-pink-400" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 leading-tight">
              Wall of Wishes
            </h2>
            <p className="mt-3 text-gray-400 text-base font-medium tracking-wide">
              Finding today's celebrations across all chapters
            </p>
          </div>

          {/* Animated loading dots */}
          <div className="flex items-center gap-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-indigo-400"
                style={{
                  animation: `pulse 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center justify-start w-full min-h-screen transition-colors duration-300 overflow-hidden relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#030712' // fallback to gray-950
      }}
    >
      {/* Dark overlay for readability (Optimized for mobile scroll) */}
      <div className="absolute inset-0 bg-[#030712]/95 z-0"></div>

      {/* ── Confetti layer (only when there are today's celebrants) ── */}
      {hasCelebrants && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            mode="boom"
            particleCount={80}
            shapeSize={18}
            launchSpeed={1.5}
            colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#E056FD', '#FF9FF3', '#FFC312']}
            spreadDeg={120}
          />
        </div>
      )}

      {/* ── Header ── */}
      <div className="fixed top-[10px] left-0 w-full z-40 bg-transparent">
        <Header />
      </div>

      <main className="mt-[80px] w-full max-w-7xl px-3 sm:px-6 md:px-10 pb-16 relative z-10">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  PAGE HERO HEADER                                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="relative mt-6 mb-10">
          {/* Decorative background gradient */}
          <div className="absolute -inset-10 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-600/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 leading-tight">
              Wall of Wishes
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-400 font-medium max-w-lg">
              Celebrate the special moments of our SIB family ✨
            </p>

            {/* Animated divider */}
            <div className="mt-6 flex items-center gap-3 opacity-40">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-indigo-400" />
              <Sparkles size={12} className="text-indigo-400" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-purple-400" />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  TODAY'S CELEBRANTS SECTION                                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {hasCelebrants && (
          <section className="mb-16">
            {/* Section header */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full blur-md opacity-50 bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse" />
                <div className="relative p-2.5 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full text-white">
                  <PartyPopper size={20} />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200">
                🎉 Today's Celebrations!
              </h2>
            </div>

            {/* Hero cards grid — big and centered for 1-3 people */}
            <div className={`
              grid gap-8 justify-items-center
              ${todaysCelebrants.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : ''}
              ${todaysCelebrants.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : ''}
              ${todaysCelebrants.length >= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto' : ''}
            `}>
              {todaysCelebrants.map((celebrant, i) => (
                <div
                  key={celebrant.id}
                  className="w-full animate-fade-in-up"
                  style={{
                    animation: `fadeInUp 0.8s ease-out ${i * 200}ms both`,
                  }}
                >
                  <WishCard
                    profileId={celebrant.profileId}
                    userId={celebrant.userId}
                    memberName={celebrant.memberName}
                    profileImage={celebrant.profileImage}
                    type={celebrant.type}
                    date="Today"
                    chapterName={celebrant.chapterName}
                    index={i}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  COUNTDOWN SECTION (when no celebrants today OR always show)   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {nextEvent && (
          <section className="mb-16">
            {hasCelebrants && (
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="relative p-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                  <Clock size={18} className="text-indigo-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-300">
                  Coming Up Next...
                </h2>
              </div>
            )}

            {!hasCelebrants && (
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm font-medium">
                  No celebrations today — but the next one is just around the corner!
                </p>
              </div>
            )}

            <CountdownSection nextEvent={nextEvent} />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  UPCOMING EVENTS LIST                                         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {upcomingEvents.length > 1 && (
          <section>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="relative p-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                <Sparkles size={18} className="text-purple-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-300">
                More Celebrations Ahead
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {upcomingEvents.slice(1).map((event, i) => {
                const eventDate = new Date(event.targetDate);
                const now = new Date();
                const diffDays = Math.ceil((eventDate - now) / 86400000);
                const dateLabel = diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;

                return (
                  <div
                    key={event.id}
                    className="opacity-0"
                    style={{
                      animation: `fadeInUp 0.8s ease-out ${i * 150 + 400}ms both`,
                    }}
                  >
                    <WishCard
                      profileId={event.profileId}
                      userId={event.userId}
                      memberName={event.memberName}
                      profileImage={event.profileImage}
                      type={event.type}
                      date={dateLabel}
                      chapterName={event.chapterName}
                      index={i}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  EMPTY STATE                                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {allEvents.length === 0 && (
          <div className="relative max-w-lg mx-auto mt-16">
            <div className="absolute -inset-2 rounded-3xl blur-xl opacity-15 bg-gradient-to-r from-gray-500 to-gray-600" />
            <div className="relative flex flex-col items-center justify-center p-16 bg-gray-900/50 rounded-3xl border border-gray-800/50 backdrop-blur-sm">
              <div className="p-5 bg-gray-800/50 rounded-full mb-6 border border-gray-700/30">
                <Gift size={56} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-500">No upcoming events</h3>
              <p className="text-gray-600 mt-3 text-center">
                There are no upcoming birthdays or anniversaries at the moment.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
