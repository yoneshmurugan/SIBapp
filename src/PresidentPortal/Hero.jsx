import { useState, useMemo, useEffect, useCallback } from 'react';
import CreateMeeting from './components/CreateMeeting';
import { MeetingsModal } from './components/MeetingModal';
import { 
  CalendarDays, 
  Calendar, 
  Clock, 
  MapPin, 
  Timer, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Hero({ onRefresh }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeetingForModal, setSelectedMeetingForModal] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/meeting/getmeetings`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to load meetings (${res.status})`);
      }
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError(err.message || "Failed to fetch meetings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Calculate live effective status for each meeting
  const classifiedMeetings = useMemo(() => {
    if (!meetings || !Array.isArray(meetings)) return [];
    const now = Date.now();

    return meetings.map(m => {
      let effectiveStatus = m.meeting_status || 'upcoming';

      if (effectiveStatus !== 'completed' && effectiveStatus !== 'cancelled' && m.meeting_date) {
        try {
          const d = new Date(m.meeting_date);
          let hours = 7;
          let minutes = 0;
          if (m.meeting_time) {
            const match = String(m.meeting_time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (match) {
              hours = parseInt(match[1], 10);
              minutes = parseInt(match[2], 10);
              if (match[3]?.toUpperCase() === 'PM' && hours < 12) hours += 12;
              if (match[3]?.toUpperCase() === 'AM' && hours === 12) hours = 0;
            }
          }
          const istOffsetMs = 5.5 * 60 * 60 * 1000;
          const startUtcMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hours, minutes) - istOffsetMs;
          const durMs = (Number(m.duration) > 0 ? Number(m.duration) : 180) * 60 * 1000;
          const endUtcMs = startUtcMs + durMs;

          if (now >= endUtcMs) {
            effectiveStatus = 'completed';
          } else if (now >= startUtcMs) {
            effectiveStatus = 'inprogress';
          }
        } catch {
          // fallback to recorded status
        }
      }

      return {
        ...m,
        effectiveStatus
      };
    });
  }, [meetings]);

  const upcomingList = useMemo(() => {
    return classifiedMeetings
      .filter(m => m.effectiveStatus === 'upcoming' || m.effectiveStatus === 'inprogress')
      .sort((a, b) => new Date(a.meeting_date) - new Date(b.meeting_date));
  }, [classifiedMeetings]);

  const completedList = useMemo(() => {
    return classifiedMeetings
      .filter(m => m.effectiveStatus === 'completed' || m.effectiveStatus === 'cancelled')
      .sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date));
  }, [classifiedMeetings]);

  const allList = useMemo(() => {
    return [...upcomingList, ...completedList];
  }, [upcomingList, completedList]);

  const displayedList = useMemo(() => {
    if (activeTab === 'upcoming') return upcomingList;
    if (activeTab === 'completed') return completedList;
    return allList;
  }, [activeTab, upcomingList, completedList, allList]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'inprogress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live Now
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <CheckCircle2 size={12} className="text-gray-500" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertCircle size={12} className="text-red-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Sparkles size={12} className="text-amber-500" />
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <CalendarDays size={26} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Chapter Meetings
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Schedule chapter assemblies, manage meeting agendas, and track member attendance.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-stretch sm:self-auto">
            <button
              onClick={fetchMeetings}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
              title="Refresh Meetings"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium text-xs sm:text-sm transition-all shadow-sm"
            >
              <Layers size={16} />
              <span>All Meetings</span>
              <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                {classifiedMeetings.length}
              </span>
            </button>

            <div className="flex-1 sm:flex-none">
              <CreateMeeting onCreated={() => { fetchMeetings(); if (typeof onRefresh === "function") onRefresh(); }} />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 pt-5 pb-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-amber-400 text-gray-950 shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Upcoming
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${
              activeTab === 'upcoming' ? 'bg-amber-500/30 text-gray-950 font-bold' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {upcomingList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-amber-400 text-gray-950 shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Completed
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${
              activeTab === 'completed' ? 'bg-amber-500/30 text-gray-950 font-bold' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {completedList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-amber-400 text-gray-950 shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            All History
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${
              activeTab === 'all' ? 'bg-amber-500/30 text-gray-950 font-bold' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {classifiedMeetings.length}
            </span>
          </button>
        </div>

        {/* Content Section: Cards Grid */}
        <div className="pt-2">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-gray-200 dark:border-gray-800" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
              <AlertCircle size={28} className="mx-auto text-red-500 mb-2" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              <button
                onClick={fetchMeetings}
                className="mt-3 px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : displayedList.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <Calendar size={36} className="mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {activeTab === 'upcoming' ? 'No Upcoming Meetings Scheduled' : 'No Meetings Found'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 mb-4">
                {activeTab === 'upcoming' 
                  ? 'Plan your next chapter assembly and notify all members automatically.' 
                  : 'There are currently no meetings matching this filter.'}
              </p>
              {activeTab === 'upcoming' && (
                <div className="inline-block">
                  <CreateMeeting onCreated={() => { fetchMeetings(); if (typeof onRefresh === "function") onRefresh(); }} />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {displayedList.slice(0, 6).map((m) => (
                <div
                  key={m._id}
                  onClick={() => setIsModalOpen(true)}
                  className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800/70 dark:to-gray-900/90 p-4 sm:p-5 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/60 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div>
                    {/* Status & Type Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {getStatusBadge(m.effectiveStatus)}
                      {m.meeting_type && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300">
                          {m.meeting_type}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {m.title}
                    </h3>

                    {/* Details Info */}
                    <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-amber-500 shrink-0" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {formatDate(m.meeting_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-amber-500 shrink-0" />
                        <span>{m.meeting_time || '07:30 AM'}</span>
                        {m.duration && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            ({m.duration} mins)
                          </span>
                        )}
                      </div>
                      {m.location && (
                        <div className="flex items-start gap-2 pt-0.5">
                          <MapPin size={15} className="text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 text-gray-700 dark:text-gray-300" title={m.location}>
                            {m.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Manage & View Agenda</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Drawer/Modal */}
        <MeetingsModal
          meetings={classifiedMeetings}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
