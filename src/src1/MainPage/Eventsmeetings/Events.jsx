import React, { useState, useEffect, useMemo } from 'react';
import Header from "../Header/Header";

import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  Sun, 
  Moon, 
  Building2, 
  Briefcase,
  Users,
  ArrowUpRight,
  LayoutGrid,
  List,
  X
} from 'lucide-react';

/**
 * CONFIGURATION
 * Backend API Base URL from environment variables
 */
const BACKEND_SERVER_URL = import.meta.env.VITE_BACKEND_SERVER;

const EventsMeetingsPage = () => {
  // --- State ---
  const [data, setData] = useState({ meetings: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('All Chapters');
  const [viewType, setViewType] = useState('upcoming'); // 'upcoming' | 'past' | 'all'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'meeting' | 'event'
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [meetingsRes, eventsRes] = await Promise.all([
          fetch(`${BACKEND_SERVER_URL}/public/getmeetings`),
          fetch(`${BACKEND_SERVER_URL}/public/getallevents`)
        ]);

        if (!meetingsRes.ok || !eventsRes.ok) throw new Error('Failed to fetch data');

        const meetingsData = await meetingsRes.json();
        const eventsData = await eventsRes.json();

        setData({ meetings: meetingsData, events: eventsData });
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Derived Data (Normalization & Filtering) ---
  const { processedData, uniqueChapters, stats } = useMemo(() => {
    const { meetings, events } = data;

    // 1. Normalize Data Structure
    const normalizedMeetings = meetings.map(m => ({
      ...m,
      _type: 'meeting',
      _id: m._id || `m-${Math.random()}`,
      _date: new Date(m.meeting_date),
      _title: m.title,
      _location: m.location,
      _chapterName: m.chapter?.chapter_name || 'General',
      _status: m.meeting_status
    }));

    const normalizedEvents = events.map(e => ({
      ...e,
      _type: 'event',
      _id: e._id || `e-${Math.random()}`,
      _date: new Date(e.event_date),
      _title: e.event_title,
      _location: e.location,
      _chapterName: e.chapter?.chapter_name || 'General',
      _status: e.event_status
    }));

    let combined = [...normalizedMeetings, ...normalizedEvents];

    // 2. Extract Unique Chapters for Dropdown
    const chapters = ['All Chapters', ...new Set(combined.map(item => item._chapterName).filter(Boolean))].sort();

    // 3. Filter Logic
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize today

    combined = combined.filter(item => {
      // Search Filter
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item._title?.toLowerCase().includes(query) || 
        item._location?.toLowerCase().includes(query) ||
        item._chapterName?.toLowerCase().includes(query);
      
      // Chapter Filter
      const matchesChapter = selectedChapter === 'All Chapters' || item._chapterName === selectedChapter;

      // Type Filter
      const matchesType = typeFilter === 'all' || item._type === typeFilter;

      // Date View Filter
      let matchesDate = true;
      if (viewType === 'upcoming') matchesDate = item._date >= now;
      if (viewType === 'past') matchesDate = item._date < now;

      return matchesSearch && matchesChapter && matchesType && matchesDate;
    });

    // 4. Sort (Ascending for Upcoming, Descending for Past)
    combined.sort((a, b) => {
      return viewType === 'past' 
        ? b._date - a._date 
        : a._date - b._date;
    });

    // 5. Stats
    const stats = {
      total: combined.length,
      meetings: combined.filter(i => i._type === 'meeting').length,
      events: combined.filter(i => i._type === 'event').length
    };

    return { processedData: combined, uniqueChapters: chapters, stats };
  }, [data, searchQuery, selectedChapter, viewType, typeFilter]);

  // --- Utility Helper ---
  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-zinc-900'}`}>
      <Header isMembers={true} />
      {/* --- Navbar --- */}
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- Header Section --- */}
        <div className="mt-30 flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Schedule <span className="text-zinc-500 font-light">& Activities</span>
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              View all chapter meetings and events in one place.
            </p>
          </div>
          
          {/* Quick Stats Pills */}
          <div className={`flex gap-3 text-sm font-medium p-1.5 rounded-lg border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
             <div className="px-3 py-1 rounded-md flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>{stats.meetings} Meetings</span>
             </div>
             <div className="px-3 py-1 rounded-md flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>{stats.events} Events</span>
             </div>
          </div>
        </div>

        {/* --- Controls Toolbar --- */}
        <div className={`sticky top-20 z-40 p-4 rounded-2xl border shadow-xl backdrop-blur-xl transition-all mb-8 ${
          isDarkMode 
            ? 'bg-zinc-900/80 border-zinc-800/50 shadow-black/20' 
            : 'bg-white/80 border-gray-200/50 shadow-gray-200/50'
        }`}>
          <div className="flex flex-col xl:flex-row gap-4 justify-between">
            
            {/* Left: Search & Chapter */}
            <div className="flex flex-col sm:flex-row gap-3 flex-grow">
              {/* Search */}
              <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <input
                  type="text"
                  placeholder="Search title, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-700 focus:ring-yellow-500/50 text-white placeholder-zinc-600' 
                      : 'bg-gray-50 border-gray-200 focus:ring-yellow-500/50 text-black'
                  }`}
                />
              </div>

              {/* Chapter Filter */}
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Building2 className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className={`appearance-none w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:outline-none cursor-pointer transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-700 focus:ring-yellow-500/50 text-white' 
                      : 'bg-gray-50 border-gray-200 focus:ring-yellow-500/50 text-black'
                  }`}
                >
                  {uniqueChapters.map(chap => (
                    <option key={chap} value={chap}>{chap}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter size={14} className={isDarkMode ? 'text-zinc-500' : 'text-zinc-400'} />
                </div>
              </div>
            </div>

            {/* Right: Type & Timeframe */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Type Toggle */}
              <div className={`flex p-1 rounded-lg border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-100 border-gray-200'}`}>
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${typeFilter === 'all' ? (isDarkMode ? 'bg-zinc-800 text-white shadow' : 'bg-white text-black shadow') : 'text-zinc-500 hover:text-zinc-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('meeting')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${typeFilter === 'meeting' ? 'bg-yellow-500 text-black shadow' : 'text-zinc-500 hover:text-zinc-400'}`}
                >
                  Meetings
                </button>
                <button
                  onClick={() => setTypeFilter('event')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${typeFilter === 'event' ? 'bg-red-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-400'}`}
                >
                  Events
                </button>
              </div>

              <div className={`h-6 w-px ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-300'}`}></div>

              {/* Timeframe Select */}
               <div className={`flex p-1 rounded-lg border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-100 border-gray-200'}`}>
                <button 
                   onClick={() => setViewType('upcoming')}
                   className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewType === 'upcoming' ? (isDarkMode ? 'bg-zinc-800 text-white shadow' : 'bg-white text-black shadow') : 'text-zinc-500'}`}
                >
                  Upcoming
                </button>
                <button 
                   onClick={() => setViewType('past')}
                   className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewType === 'past' ? (isDarkMode ? 'bg-zinc-800 text-white shadow' : 'bg-white text-black shadow') : 'text-zinc-500'}`}
                >
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Content Grid --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`h-72 rounded-2xl ${isDarkMode ? 'bg-zinc-900' : 'bg-gray-200'}`}></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 flex flex-col items-center justify-center text-center">
             <div className="bg-red-500/20 p-3 rounded-full mb-3">
               <X size={24} />
             </div>
             <h3 className="font-bold text-lg">Failed to load schedule</h3>
             <p className="opacity-80 mt-1">{error}</p>
          </div>
        ) : processedData.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-50 text-center">
            <LayoutGrid size={64} className="mb-4 text-zinc-600" />
            <h3 className="text-xl font-medium">No schedule items found</h3>
            <p className="mt-2 max-w-sm">
              We couldn't find any {typeFilter !== 'all' ? typeFilter + 's' : 'items'} matching your current filters.
            </p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedChapter('All Chapters'); setTypeFilter('all'); setViewType('upcoming');}}
              className="mt-6 px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {processedData.map((item) => {
              const isEvent = item._type === 'event';
              const isPast = item._date < new Date();
              
              // Dynamic Colors based on Type
              const themeColor = isEvent ? 'red' : 'yellow';
              const borderColor = isDarkMode 
                ? (isEvent ? 'group-hover:border-red-900/50' : 'group-hover:border-yellow-900/50')
                : (isEvent ? 'group-hover:border-red-300' : 'group-hover:border-yellow-400');
                
              const badgeBg = isEvent ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';

              return (
                <div 
                  key={item._id}
                  className={`group relative flex flex-col rounded-2xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-900/80 shadow-lg shadow-black/20' 
                      : 'bg-white border-gray-200 hover:shadow-xl hover:shadow-gray-200/50'
                  } ${borderColor} ${isPast ? 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : ''}`}
                >
                  
                  {/* Card Header */}
                  <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeBg} flex items-center gap-1.5`}>
                         {isEvent ? <Briefcase size={10} /> : <Users size={10} />}
                         {isEvent ? 'Event' : 'Meeting'}
                      </div>
                      
                      {item._status && (
                        <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded border ${
                           isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-gray-100 border-gray-200 text-gray-500'
                        }`}>
                          {item._status}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold mb-2 line-clamp-2 leading-snug group-hover:text-${themeColor}-500 transition-colors`}>
                      {item._title}
                    </h3>

                    {/* Meta Data Row */}
                    <div className="flex flex-wrap gap-y-2 text-sm opacity-70 mb-4">
                      <div className="w-full flex items-center gap-2">
                         <Building2 size={14} className={isEvent ? 'text-red-500' : 'text-yellow-500'} />
                         <span className="font-medium truncate">{item._chapterName}</span>
                      </div>
                      <div className="w-full flex items-center gap-2">
                         <MapPin size={14} />
                         <span className="truncate">{item._location || 'Online / TBD'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer (Date Area) */}
                  <div className={`px-5 py-4 border-t flex items-center justify-between ${isDarkMode ? 'bg-zinc-950/30 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                         {item._date.toLocaleString('en-US', { weekday: 'long' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className={isEvent ? 'text-red-500' : 'text-yellow-500'} />
                        <span className="font-semibold text-sm">
                          {formatDate(item._date)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                       <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                         Time
                       </span>
                       <div className="flex items-center justify-end gap-2">
                         <Clock size={14} className={isDarkMode ? 'text-zinc-600' : 'text-gray-400'} />
                         <span className="font-semibold text-sm">
                            {(isEvent ? item.event_time : item.meeting_time) || 'TBD'}
                         </span>
                       </div>
                    </div>
                  </div>
                  
                  {/* Hover Action */}
                  <div className={`absolute top-4 right-4 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`}>
                     <div className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-white shadow-md text-black'}`}>
                        <ArrowUpRight size={16} />
                     </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default EventsMeetingsPage;