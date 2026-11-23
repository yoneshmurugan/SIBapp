import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon, 
  ArrowLeft, Loader2, AlertCircle, Calendar, ArrowLeftIcon, 
  Users, MapPin, MessageSquare, Info, Folder, Layers, Search, 
  Sparkles, Check, ChevronDown
} from 'lucide-react';

const BACKEND_SERVER_URL = import.meta.env.VITE_BACKEND_SERVER; 
const GALLERY_API_URL = `${BACKEND_SERVER_URL}/gallery/all`;
const M2M_PUBLIC_API_URL = `${BACKEND_SERVER_URL}/public/getm2mslips`;

// Lightbox Component with Responsive Details (Bottom Sheet on Mobile, Sidebar on Desktop)
const Lightbox = ({ isOpen, image, index, total, onClose, onNext, onPrev, hasNext, hasPrev, m2mSlip }) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) setShowDetails(false);
  }, [isOpen, image]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md animate-in fade-in duration-200 flex flex-col select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/10 z-50 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={onClose} 
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all"
            title="Close"
          >
            <X size={20} />
          </button>
          
          <span className="text-xs sm:text-sm font-semibold text-white/70 tracking-wider">
            {index + 1} / {total}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {m2mSlip && (
            <button
              onClick={() => setShowDetails(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                showDetails 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Info size={14} />
              <span>Details</span>
            </button>
          )}

          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev(); }} 
              disabled={!hasPrev}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all ${
                hasPrev 
                  ? 'text-white hover:bg-white/20 active:scale-95 bg-white/10' 
                  : 'text-white/20 cursor-not-allowed bg-white/5'
              }`}
              title="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }} 
              disabled={!hasNext}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all ${
                hasNext 
                  ? 'text-white hover:bg-white/20 active:scale-95 bg-white/10' 
                  : 'text-white/20 cursor-not-allowed bg-white/5'
              }`}
              title="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Presentation Viewport */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Full Image */}
        <div 
          className="flex-1 flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <img 
            src={image.src} 
            alt="Gallery preview"
            className="max-w-full max-h-full object-contain shadow-2xl rounded-xl select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* M2M Details Panel (Desktop: Sidebar Drawer | Mobile: Bottom Sheet Drawer) */}
        {m2mSlip && showDetails && (
          <div className="fixed md:static bottom-0 left-0 right-0 max-h-[75vh] md:max-h-full md:w-96 bg-neutral-900/98 md:bg-neutral-900/95 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/15 rounded-t-3xl md:rounded-none z-50 overflow-y-auto animate-in slide-in-from-bottom md:slide-in-from-right duration-300 shadow-2xl">
            {/* Mobile Grab Handle */}
            <div className="md:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-white/25" />
            </div>

            <div className="p-5 sm:p-6 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full inline-block">
                    {m2mSlip.chapter?.chapter_name || 'SIB Chapter'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">One-to-One Meeting</h3>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="md:hidden p-1.5 text-white/50 hover:text-white rounded-full bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Members Involved */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                  <Users size={13} className="text-emerald-400" />
                  Members
                </span>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <p className="text-white text-sm font-semibold truncate">{m2mSlip.member1?.username || 'Member 1'}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
                    <p className="text-white text-sm font-semibold truncate">{m2mSlip.member2?.username || 'Member 2'}</p>
                  </div>
                </div>
              </div>

              {/* Date & Location */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Calendar size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Date</span>
                    <p className="text-white text-sm font-semibold mt-0.5">
                      {m2mSlip.meeting_date ? new Date(m2mSlip.meeting_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Location</span>
                    <p className="text-white text-sm font-semibold mt-0.5">{m2mSlip.location || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Discussion Points */}
              {m2mSlip.discussion_points && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <MessageSquare size={13} className="text-emerald-400" />
                    Discussion Notes
                  </span>
                  <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed">{m2mSlip.discussion_points}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper: Match M2M title
const isM2MAlbum = (album) => {
  if (!album || !album.title) return false;
  return /(?:m2m|m\s*to\s*m)\s*(?:gallery|slips)?/i.test(album.title);
};

// Helper: Format title for display
const formatM2MTitle = (title) => {
  if (!title) return "";
  return title
    .replace(/\s*m2m\s*gallery/i, ' M to M')
    .replace(/\s*m2m\b/i, ' M to M')
    .trim();
};

const Album = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [currentView, setCurrentView] = useState("home"); // 'home', 'm2m', 'album'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  // Category Tab: 'all' | 'events' | 'm2m'
  const [activeTab, setActiveTab] = useState("all");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Data Fetching State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // M2M Slips State
  const [m2mSlips, setM2mSlips] = useState([]);

  // System Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => {
      if (e.matches) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Fetch M2M Slips from public API
  useEffect(() => {
    fetch(M2M_PUBLIC_API_URL, { method: 'GET' })
      .then(res => res.ok ? res.json() : [])
      .then(data => setM2mSlips(Array.isArray(data) ? data : []))
      .catch(() => setM2mSlips([]));
  }, []);

  // Fetch Albums on Mount
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(GALLERY_API_URL);
        if (!response.ok) throw new Error('Failed to fetch albums');

        const data = await response.json();
        const normalized = (data || []).map(album => ({
          id: album._id || album.id,
          title: album.title,
          date: album.date,
          coverImg: album.coverImg,
          photos: (album.photos || []).map(url => ({
            src: url,
            width: 1000,
            height: 800
          }))
        }));
        
        setAlbums(normalized);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching gallery:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Partition albums
  const { m2mAlbums, regularAlbums, totalM2mPhotos, m2mCoverImage } = useMemo(() => {
    const m2m = [];
    const regular = [];

    (albums || []).forEach(album => {
      if (isM2MAlbum(album)) {
        m2m.push(album);
      } else {
        regular.push(album);
      }
    });

    const totalPhotos = m2m.reduce((sum, a) => sum + (a.photos?.length || 0), 0);
    const albumWithCover = m2m.find(a => a.coverImg || (a.photos && a.photos.length > 0));
    const cover = albumWithCover?.coverImg || albumWithCover?.photos?.[0]?.src || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800";

    return {
      m2mAlbums: m2m,
      regularAlbums: regular,
      totalM2mPhotos: totalPhotos,
      m2mCoverImage: cover
    };
  }, [albums]);

  // Filtered regular albums by search
  const filteredRegularAlbums = useMemo(() => {
    if (!searchQuery.trim()) return regularAlbums;
    const q = searchQuery.toLowerCase();
    return regularAlbums.filter(a => (a.title || '').toLowerCase().includes(q));
  }, [regularAlbums, searchQuery]);

  // Filtered M2M chapter albums by search
  const filteredM2mAlbums = useMemo(() => {
    if (!searchQuery.trim()) return m2mAlbums;
    const q = searchQuery.toLowerCase();
    return m2mAlbums.filter(a => (a.title || '').toLowerCase().includes(q));
  }, [m2mAlbums, searchQuery]);

  const handleOpenM2MFolder = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedAlbum(null);
    setCurrentView("m2m");
    setSearchQuery("");
  };

  const handleFolderClick = (album) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedAlbum(album);
    setCurrentView("album");
  };

  const handleBackClick = () => {
    if (currentView === "album") {
      if (selectedAlbum && isM2MAlbum(selectedAlbum)) {
        setSelectedAlbum(null);
        setCurrentView("m2m");
      } else {
        setSelectedAlbum(null);
        setCurrentView("home");
      }
    } else if (currentView === "m2m") {
      setCurrentView("home");
      setSearchQuery("");
    } else {
      navigate('/');
    }
    setCurrentImageIndex(0);
    setLightboxOpen(false);
  };

  const currentPhotos = selectedAlbum ? (selectedAlbum.photos || []) : [];

  // Match current photo to M2M slip
  const currentM2mSlip = lightboxOpen && currentPhotos[currentImageIndex]
    ? m2mSlips.find(slip => slip.image_url === currentPhotos[currentImageIndex].src) || null
    : null;

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1 < currentPhotos.length ? prev + 1 : 0));
  }, [currentPhotos.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 >= 0 ? prev - 1 : currentPhotos.length - 1));
  }, [currentPhotos.length]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit',
        month: 'short',
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getCoverImageUrl = (album) => {
    if (!album.coverImg) {
      if (album.photos && album.photos.length > 0) {
        return album.photos[0].src;
      }
      return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";
    }
    return album.coverImg;
  };

  const displayAlbumTitle = selectedAlbum 
    ? (isM2MAlbum(selectedAlbum) ? formatM2MTitle(selectedAlbum.title) : selectedAlbum.title) 
    : "";

  // Loading View
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col items-center justify-center space-y-3 transition-colors duration-200">
        <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-500" size={32} />
        <p className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-widest">
          Loading Gallery...
        </p>
      </div>
    );
  }

  // Error View
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-rose-200/60 dark:border-rose-900/40 shadow-xl text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unable to Load Gallery</h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 font-sans selection:bg-emerald-500/30 transition-colors duration-200 pb-24">
      
      {/* Top Frosted Glass Header */}
      <header className="border-b border-gray-200/80 dark:border-neutral-800/80 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md sticky top-0 z-40 pt-[env(safe-area-inset-top,0px)] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          
          {/* Left: Back button & Breadcrumb */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-hidden min-w-0">
            <button 
              onClick={handleBackClick}
              className="w-9 h-9 flex items-center justify-center bg-gray-100/90 hover:bg-gray-200 dark:bg-neutral-800/90 dark:hover:bg-neutral-700 rounded-full text-gray-700 dark:text-neutral-300 transition-all active:scale-95 shrink-0"
              title="Back"
            >
              <ArrowLeft size={17} />
            </button>

            {/* Breadcrumb Root */}
            <div
              className="flex items-center space-x-2 cursor-pointer shrink-0"
              onClick={() => {
                setSelectedAlbum(null);
                setCurrentView("home");
                setSearchQuery("");
              }}
            >
              <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-xl">
                <ImageIcon className="text-emerald-600 dark:text-emerald-500" size={17} />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-none">
                Gallery
              </h1>
            </div>

            {/* Breadcrumb Level 1: M to M Slips */}
            {currentView === "m2m" && (
              <>
                <span className="text-gray-300 dark:text-neutral-700 text-sm select-none shrink-0">/</span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                  M to M Slips
                </span>
              </>
            )}

            {/* Breadcrumb Level 2: Specific Album */}
            {currentView === "album" && selectedAlbum && (
              <>
                <span className="text-gray-300 dark:text-neutral-700 text-sm select-none shrink-0">/</span>
                {isM2MAlbum(selectedAlbum) ? (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedAlbum(null);
                        setCurrentView("m2m");
                      }}
                      className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline truncate max-w-[70px] sm:max-w-none"
                    >
                      M to M
                    </button>
                    <span className="text-gray-300 dark:text-neutral-700 text-sm select-none shrink-0">/</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-neutral-300 truncate max-w-[110px] sm:max-w-none">
                      {displayAlbumTitle}
                    </span>
                  </>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-neutral-300 truncate max-w-[130px] sm:max-w-none">
                    {displayAlbumTitle}
                  </span>
                )}
              </>
            )}
          </div>
          
          {/* Right: Counter Chip */}
          <div className="shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider bg-gray-100 dark:bg-neutral-800 px-2.5 sm:px-3 py-1 rounded-full border border-gray-200/60 dark:border-neutral-700/60 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {currentView === "m2m" 
                ? `${m2mAlbums.length} Chapters` 
                : currentView === "album" 
                  ? `${currentPhotos.length} Photos`
                  : `${regularAlbums.length + (m2mAlbums.length > 0 ? 1 : 0)} Folders`}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* VIEW 1: HOME (All Collections & Parent M to M Folder) */}
        {currentView === "home" && (
          <div className="animate-in fade-in duration-300">
            
            {/* Header Title & Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Collections
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
                  Browse moments, meetings, and chapter interactions
                </p>
              </div>

              {/* Controls: Search and Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full pl-9 pr-8 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Segmented Filter Pills */}
                {!searchQuery && (
                  <div className="inline-flex p-1 bg-gray-200/70 dark:bg-neutral-900 rounded-xl border border-gray-200/60 dark:border-neutral-800/80 self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "all"
                          ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveTab("events")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "events"
                          ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      Events ({regularAlbums.length})
                    </button>
                    {m2mAlbums.length > 0 && (
                      <button
                        onClick={() => setActiveTab("m2m")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "m2m"
                            ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        M to M ({m2mAlbums.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile 2-column Grid | Desktop 4-column Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              
              {/* Parent M to M Folder Card (Shown in 'all' or 'm2m' tab, or if search matches) */}
              {m2mAlbums.length > 0 && (activeTab === "all" || activeTab === "m2m" || (searchQuery && filteredM2mAlbums.length > 0)) && (
                <div 
                  onClick={handleOpenM2MFolder}
                  className="group relative bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-500/40 hover:border-emerald-500 dark:border-emerald-500/30 dark:hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
                    <img 
                      src={m2mCoverImage} 
                      alt="M to M Slips" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Top Folder Tag */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm">
                      <Folder size={12} />
                      <span>Folder</span>
                    </div>

                    {/* Bottom Floating Stats */}
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between text-white text-[11px] sm:text-xs font-semibold">
                      <span className="flex items-center gap-1 opacity-90">
                        <Users size={12} />
                        {m2mAlbums.length} Chapters
                      </span>
                      <span className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px]">
                        {totalM2mPhotos} Photos
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        <Layers size={11} /> Chapter Slips
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors line-clamp-1">
                        M to M Slips
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                        {m2mAlbums.length} Chapter collections
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Open Folder</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              )}

              {/* Regular Event Albums (Shown in 'all' or 'events' tab) */}
              {(activeTab === "all" || activeTab === "events") && filteredRegularAlbums.map((album) => (
                <div 
                  key={album.id}
                  onClick={() => handleFolderClick(album)}
                  className="group bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/70 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
                    <img 
                      src={getCoverImageUrl(album)} 
                      alt={album.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Date Pill */}
                    {album.date && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/50 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {formatDate(album.date)}
                      </div>
                    )}

                    {/* Photo count pill */}
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ImageIcon size={11} />
                      <span>{album.photos?.length || 0}</span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {album.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-500 mt-1">
                        {album.photos?.length || 0} Moments
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredRegularAlbums.length === 0 && (!searchQuery || filteredM2mAlbums.length === 0) && (
              <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800 mt-4">
                <ImageIcon className="mx-auto text-gray-300 dark:text-neutral-600 mb-3" size={40} />
                <h4 className="text-sm font-bold text-gray-700 dark:text-neutral-300">No collections found</h4>
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
                  {searchQuery ? `No results for "${searchQuery}"` : "No albums available"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: M TO M CHAPTER SUB-FOLDERS */}
        {currentView === "m2m" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Folder size={11} /> Folder
                  </span>
                  <span className="text-xs text-gray-400 dark:text-neutral-500">·</span>
                  <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">
                    {m2mAlbums.length} Chapters
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  M to M Slips
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
                  Chapter-wise One-to-One meeting proof of work photos
                </p>
              </div>

              {/* Controls: Search and Back */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative flex-1 sm:w-56">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chapters..."
                    className="w-full pl-8 pr-7 py-1.5 sm:py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setCurrentView("home");
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300 transition-all shrink-0"
                >
                  <ArrowLeft size={14} />
                  <span>All Collections</span>
                </button>
              </div>
            </div>

            {/* Grid of Chapter Sub-Folders (2 columns mobile, 4 columns desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredM2mAlbums.map((album) => (
                <div 
                  key={album.id}
                  onClick={() => handleFolderClick(album)}
                  className="group bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/70 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
                    <img 
                      src={getCoverImageUrl(album)} 
                      alt={formatM2MTitle(album.title)} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ImageIcon size={11} />
                      <span>{album.photos?.length || 0}</span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-1">
                        Chapter
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {formatM2MTitle(album.title)}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-500 mt-0.5">
                        {album.photos?.length || 0} Moments
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredM2mAlbums.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800 mt-4">
                <ImageIcon className="mx-auto text-gray-300 dark:text-neutral-600 mb-3" size={40} />
                <h4 className="text-sm font-bold text-gray-700 dark:text-neutral-300">No chapters found</h4>
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
                  No chapter matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ALBUM PHOTOS (3 columns mobile, 6 columns desktop) */}
        {currentView === "album" && selectedAlbum && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Album Hero Banner (if cover image present) */}
            {selectedAlbum.coverImg && (
              <div className="relative w-full h-36 sm:h-48 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8 shadow-md">
                <img src={selectedAlbum.coverImg} alt={displayAlbumTitle} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex items-end justify-between">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">{displayAlbumTitle}</h2>
                    <p className="text-white/80 text-[11px] sm:text-xs font-semibold mt-1 flex items-center gap-2">
                      {selectedAlbum.date && (
                        <>
                          <Calendar size={12} />
                          <span>{formatDate(selectedAlbum.date)}</span>
                          <span className="text-white/40">·</span>
                        </>
                      )}
                      <span>{currentPhotos.length} photos</span>
                    </p>
                  </div>
                  <button 
                    onClick={handleBackClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs sm:text-sm font-bold text-white transition-all active:scale-95"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-header (if no cover image) */}
            {!selectedAlbum.coverImg && (
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{displayAlbumTitle}</h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    {formatDate(selectedAlbum.date)} · {currentPhotos.length} photos
                  </p>
                </div>
                <button 
                  onClick={handleBackClick}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300 transition-all"
                >
                  <ArrowLeft size={15} />
                  <span>{isM2MAlbum(selectedAlbum) ? "M to M Slips" : "Collections"}</span>
                </button>
              </div>
            )}

            {/* Photos Grid: 3 columns mobile | 4-6 columns desktop */}
            {currentPhotos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-3">
                {currentPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="group relative aspect-square bg-gray-200 dark:bg-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden cursor-zoom-in"
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={photo.src} 
                      alt={`Gallery item ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy" 
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <ZoomIn className="text-white drop-shadow-md" size={20} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
                <ImageIcon className="mx-auto text-gray-300 dark:text-neutral-600 mb-3" size={40} />
                <p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  No photos in this album yet
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <Lightbox 
        isOpen={lightboxOpen}
        image={currentPhotos[currentImageIndex]}
        index={currentImageIndex}
        total={currentPhotos.length}
        onClose={() => setLightboxOpen(false)}
        onNext={nextImage}
        onPrev={prevImage}
        hasNext={currentPhotos.length > 1}
        hasPrev={currentPhotos.length > 1}
        m2mSlip={currentM2mSlip}
      />
    </div>
  );
};

export default Album;
