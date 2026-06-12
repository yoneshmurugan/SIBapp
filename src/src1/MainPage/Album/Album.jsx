import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon, 
  ArrowLeft, Loader2, AlertCircle, Calendar, ArrowLeftIcon, 
  Users, MapPin, MessageSquare, Info 
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 z-50">
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

const Album = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [currentView, setCurrentView] = useState("home"); // 'home' or 'album'
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

  const handleFolderClick = (album) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedAlbum(album);
    setCurrentView("album");
  };

  const handleBackClick = () => {
    setSelectedAlbum(null);
    setCurrentView("home");
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
        return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";
    }
    return album.coverImg;
  };

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
      <header className="border-b border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Back Button */}
            <button 
                onClick={() => currentView === "album" ? handleBackClick() : navigate('/')}
                className="mr-1 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Back"
            >
                <ArrowLeftIcon size={18} />
            </button>

            {/* Title / Breadcrumb */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => handleBackClick()}
            >
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <ImageIcon className="text-emerald-600 dark:text-emerald-500" size={18} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Gallery</h1>
                {selectedAlbum && (
                  <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest -mt-0.5">
                    SIB Collections
                  </p>
                )}
              </div>
            </div>

            {selectedAlbum && (
              <>
                <span className="text-gray-300 dark:text-neutral-700 font-light text-lg select-none">/</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300 truncate max-w-[140px]">
                  {selectedAlbum.title}
                </span>
              </>
            )}
          </div>
          
          <div className="hidden xs:block">
            <span className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Public View</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: ALBUM LIST */}
        {currentView === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Albums & Collections</h2>
                <p className="text-sm text-gray-500 dark:text-neutral-500">
                    {albums.length} collections available to explore
                </p>
            </div>

            {albums.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl">
                    <ImageIcon className="mx-auto h-10 w-10 text-gray-300 dark:text-neutral-700 mb-4" />
                    <h3 className="text-base font-semibold text-gray-700 dark:text-white">No albums found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {albums.map((album) => (
                        <div 
                            key={album.id} 
                            className="group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                            onClick={() => handleFolderClick(album)}
                        >
                            <div className="aspect-[4/3] relative overflow-hidden">
                                <img 
                                    src={getCoverImageUrl(album)} 
                                    alt={album.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-5">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider">
                                    {formatDate(album.date)}
                                </span>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-3 group-hover:text-emerald-600 transition-colors">{album.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                                    {album.photos?.length || 0} Moments captured
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}

        {/* VIEW 2: ALBUM PHOTOS */}
        {currentView === "album" && selectedAlbum && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Album Hero Banner */}
            {selectedAlbum.coverImg && (
              <div className="relative w-full h-44 rounded-3xl overflow-hidden mb-8 shadow-md">
                <img src={selectedAlbum.coverImg} alt={selectedAlbum.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-7">
                  <h2 className="text-2xl font-black text-white">{selectedAlbum.title}</h2>
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAlbum.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(selectedAlbum.date)}</p>
                </div>
              )}
              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleBackClick}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-sm font-bold transition-all text-gray-700 dark:text-neutral-300"
                 >
                    <ArrowLeft size={16} /> Back
                 </button>
              </div>
            </div>

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