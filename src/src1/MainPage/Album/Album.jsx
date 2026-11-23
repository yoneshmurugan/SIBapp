import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon, 
  ArrowLeft, Loader2, AlertCircle, Calendar, ArrowLeftIcon, 
  Users, MapPin, MessageSquare, Info, Folder, Layers 
} from 'lucide-react';

// CSS - We keep the import if needed for some global styles, but we'll use Tailwind for the UI
import "./Album.css";

const BACKEND_SERVER_URL = import.meta.env.VITE_BACKEND_SERVER; 
const GALLERY_API_URL = `${BACKEND_SERVER_URL}/gallery/all`;
const M2M_PUBLIC_API_URL = `${BACKEND_SERVER_URL}/public/getm2mslips`;

const Lightbox = ({ isOpen, image, onClose, onNext, onPrev, hasNext, hasPrev, m2mSlip }) => {
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (isOpen) setShowDetails(true); // Reset on open
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
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 z-50 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <X size={22} />
        </button>

        {m2mSlip && (
          <button
            onClick={() => setShowDetails(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              showDetails ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Info size={14} />
            M2M Details
          </button>
        )}

        <div className="flex gap-2">
          {hasPrev && (
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={22} />
            </button>
          )}
          {hasNext && (
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Image */}
        <div 
          className="flex-1 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <img 
            src={image.src} 
            alt="Gallery Image"
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* M2M Details Panel */}
        {m2mSlip && showDetails && (
          <div className="w-full md:w-80 bg-neutral-900/95 border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
            <div className="p-5">
              <h3 className="text-white font-bold text-base mb-1 text-left">M2M Meeting Details</h3>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5 text-left">
                {m2mSlip.chapter?.chapter_name || 'Chapter'}
              </p>

              {/* Members */}
              <div className="bg-white/5 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={14} className="text-neutral-400" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Members</span>
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <p className="text-white text-sm font-semibold">{m2mSlip.member1?.username || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <p className="text-white text-sm font-semibold">{m2mSlip.member2?.username || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Date & Location */}
              <div className="bg-white/5 rounded-xl p-4 mb-3 space-y-3 text-left">
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Meeting Date</p>
                    <p className="text-white text-sm font-semibold mt-1">
                      {m2mSlip.meeting_date ? new Date(m2mSlip.meeting_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Location</p>
                    <p className="text-white text-sm font-semibold mt-1">{m2mSlip.location || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Discussion Points */}
              {m2mSlip.discussion_points && (
                <div className="bg-white/5 rounded-xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-neutral-400" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Discussion</span>
                  </div>
                  <p className="text-neutral-200 text-sm leading-relaxed">{m2mSlip.discussion_points}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper: Check if album is an M2M album
const isM2MAlbum = (album) => {
  if (!album || !album.title) return false;
  return /(?:m2m|m\s*to\s*m)\s*(?:gallery|slips)?/i.test(album.title);
};

// Helper: Format M2M title for display (e.g., "MCC M2M gallery" -> "MCC M to M")
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
  const [currentView, setCurrentView] = useState("home"); // 'home', 'm2m', or 'album'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Data Fetching State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // M2M Slips State
  const [m2mSlips, setM2mSlips] = useState([]);

  // System Preference Dark Mode
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

  // Fetch M2M slips from public API
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

        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }

        const data = await response.json();
        
        // Normalize album data
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

  // Partition albums into M2M albums and regular event albums
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

  const handleOpenM2MFolder = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedAlbum(null);
    setCurrentView("m2m");
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
    } else {
      navigate('/');
    }
    setCurrentImageIndex(0);
    setLightboxOpen(false);
  };

  const currentPhotos = selectedAlbum ? (selectedAlbum.photos || []) : [];

  // Match current lightbox photo to an M2M slip
  const currentM2mSlip = lightboxOpen && currentPhotos[currentImageIndex]
    ? m2mSlips.find(slip => slip.image_url === currentPhotos[currentImageIndex].src) || null
    : null;

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1 < currentPhotos.length ? prev + 1 : 0));
  }, [currentPhotos.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 >= 0 ? prev - 1 : currentPhotos.length - 1));
  }, [currentPhotos.length]);

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit',
        month: 'short',
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper: Get Cover Image URL
  const getCoverImageUrl = (album) => {
    if (!album.coverImg) {
      if (album.photos && album.photos.length > 0) {
        return album.photos[0].src;
      }
      return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";
    }
    return album.coverImg;
  };

  // Display title for current album
  const displayAlbumTitle = selectedAlbum 
    ? (isM2MAlbum(selectedAlbum) ? formatM2MTitle(selectedAlbum.title) : selectedAlbum.title) 
    : "";

  // --- RENDER LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex flex-col items-center justify-center space-y-3 transition-colors duration-200">
        <Loader2 className="animate-spin text-gray-400 dark:text-neutral-600" size={28} />
        <p className="text-xs font-bold text-gray-400 dark:text-neutral-600 uppercase tracking-widest">Loading Collections...</p>
      </div>
    );
  }

  // --- RENDER ERROR STATE ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unable to load gallery</h3>
          <p className="text-sm text-gray-50 dark:text-neutral-400 mt-2 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-bold transition-all active:scale-95">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-neutral-100 font-sans selection:bg-emerald-500/30 transition-colors duration-200 pb-20">
      
      {/* HEADER */}
      <header className="border-b border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
            {/* Back Button */}
            <button 
              onClick={handleBackClick}
              className="mr-1 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
              title="Back"
            >
              <ArrowLeftIcon size={18} />
            </button>

            {/* Title / Breadcrumb Root */}
            <div
              className="flex items-center space-x-2 cursor-pointer shrink-0"
              onClick={() => {
                setSelectedAlbum(null);
                setCurrentView("home");
              }}
            >
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <ImageIcon className="text-emerald-600 dark:text-emerald-500" size={18} />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Gallery</h1>
                {currentView !== "home" && (
                  <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest -mt-0.5 hidden sm:block">
                    SIB Collections
                  </p>
                )}
              </div>
            </div>

            {/* Breadcrumb level 1: M to M Slips folder */}
            {currentView === "m2m" && (
              <>
                <span className="text-gray-300 dark:text-neutral-700 font-light text-lg select-none">/</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300 truncate">
                  M to M Slips
                </span>
              </>
            )}

            {/* Breadcrumb level 2: Specific Album */}
            {currentView === "album" && selectedAlbum && (
              <>
                <span className="text-gray-300 dark:text-neutral-700 font-light text-lg select-none">/</span>
                {isM2MAlbum(selectedAlbum) ? (
                  <>
                    <span 
                      onClick={() => {
                        setSelectedAlbum(null);
                        setCurrentView("m2m");
                      }}
                      className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer truncate max-w-[80px] sm:max-w-none"
                    >
                      M to M Slips
                    </span>
                    <span className="text-gray-300 dark:text-neutral-700 font-light text-lg select-none">/</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300 truncate max-w-[120px] sm:max-w-none">
                      {displayAlbumTitle}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300 truncate max-w-[140px] sm:max-w-none">
                    {displayAlbumTitle}
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="hidden xs:block shrink-0">
            <span className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-neutral-700/50">
              {currentView === "m2m" 
                ? `${m2mAlbums.length} Chapters` 
                : currentView === "album" 
                  ? `${currentPhotos.length} Photos`
                  : `${(regularAlbums.length + (m2mAlbums.length > 0 ? 1 : 0))} Collections`}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* VIEW 1: HOME (All Collections & M to M Common Folder) */}
        {currentView === "home" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Collections</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">Explore moments, events, and chapter interactions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Special Parent Folder: M to M Slips */}
              {m2mAlbums.length > 0 && (
                <div 
                  onClick={handleOpenM2MFolder}
                  className="group bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 dark:from-neutral-800 dark:via-neutral-800/90 dark:to-neutral-800/70 rounded-3xl overflow-hidden border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
                    <img 
                      src={m2mCoverImage} 
                      alt="M to M Slips Folder" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow flex items-center gap-1.5 backdrop-blur-sm">
                      <Folder size={13} />
                      <span>Folder</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-xs font-semibold opacity-90 flex items-center gap-1.5">
                        <Users size={13} />
                        {m2mAlbums.length} Chapters
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider inline-flex items-center gap-1">
                        <Layers size={11} /> Chapter Collections
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-3 group-hover:text-emerald-600 transition-colors">
                        M to M Slips
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                        {totalM2mPhotos} Moments across {m2mAlbums.length} chapters
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-700/50 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Browse Chapters</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              )}

              {/* Regular Event Albums */}
              {regularAlbums.map((album) => (
                <div 
                  key={album.id}
                  onClick={() => handleFolderClick(album)}
                  className="group bg-white dark:bg-neutral-800/80 rounded-3xl overflow-hidden border border-gray-100 dark:border-neutral-700/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
                    <img 
                      src={getCoverImageUrl(album)} 
                      alt={album.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider">
                        {formatDate(album.date) || 'Event'}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-3 group-hover:text-emerald-600 transition-colors">
                        {album.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                        {album.photos?.length || 0} Moments captured
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {regularAlbums.length === 0 && m2mAlbums.length === 0 && (
              <div className="text-center py-24 bg-white dark:bg-neutral-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
                <ImageIcon className="mx-auto text-gray-300 dark:text-neutral-600 mb-3" size={48} />
                <p className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">No collections found</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: M TO M SUB-FOLDERS (Chapters inside M to M folder) */}
        {currentView === "m2m" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                    <Folder size={12} /> Folder
                  </span>
                  <span className="text-xs text-gray-400 dark:text-neutral-500">·</span>
                  <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">
                    {m2mAlbums.length} Chapters
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  M to M Slips
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
                  Chapter-wise One-to-One meeting proof of work photos
                </p>
              </div>

              <button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentView("home");
                }}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-sm font-bold transition-all text-gray-700 dark:text-neutral-300"
              >
                <ArrowLeft size={16} /> All Collections
              </button>
            </div>

            {/* Grid of Chapter Sub-Folders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {m2mAlbums.map((album) => (
                <div 
                  key={album.id}
                  onClick={() => handleFolderClick(album)}
                  className="group bg-white dark:bg-neutral-800/80 rounded-3xl overflow-hidden border border-gray-100 dark:border-neutral-700/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
                    <img 
                      src={getCoverImageUrl(album)} 
                      alt={formatM2MTitle(album.title)} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider">
                        {formatDate(album.date) || 'Chapter Folder'}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-3 group-hover:text-emerald-600 transition-colors">
                        {formatM2MTitle(album.title)}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                        {album.photos?.length || 0} Moments captured
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: ALBUM PHOTOS */}
        {currentView === "album" && selectedAlbum && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Album Hero Banner */}
            {selectedAlbum.coverImg && (
              <div className="relative w-full h-44 rounded-3xl overflow-hidden mb-8 shadow-md">
                <img src={selectedAlbum.coverImg} alt={displayAlbumTitle} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-7">
                  <h2 className="text-2xl font-black text-white">{displayAlbumTitle}</h2>
                  <p className="text-white/70 text-xs font-semibold mt-1 flex items-center gap-2">
                    <Calendar size={12} />
                    {formatDate(selectedAlbum.date)}
                    <span className="text-white/40">·</span>
                    {currentPhotos.length} photos
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6 px-1">
              {!selectedAlbum.coverImg && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{displayAlbumTitle}</h2>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(selectedAlbum.date)}</p>
                </div>
              )}
              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleBackClick}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-sm font-bold transition-all text-gray-700 dark:text-neutral-300"
                 >
                    <ArrowLeft size={16} /> {isM2MAlbum(selectedAlbum) ? "M to M Slips" : "Back"}
                 </button>
              </div>
            </div>

            {currentPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="group relative aspect-square bg-gray-200 dark:bg-neutral-800 rounded-2xl overflow-hidden cursor-zoom-in"
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={photo.src} 
                      alt={`Gallery item ${index}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <ZoomIn className="text-white drop-shadow-lg" size={24} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-neutral-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800">
                <ImageIcon className="mx-auto text-gray-300 dark:text-neutral-600 mb-3" size={48} />
                <p className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">No photos in this album yet</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* LIGHTBOX */}
      <Lightbox 
        isOpen={lightboxOpen}
        image={currentPhotos[currentImageIndex]}
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
