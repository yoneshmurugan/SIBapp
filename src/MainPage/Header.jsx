import { HeaderAvatar } from './Components/Avatar';
import Sidebar from './SideBar/SideBar';
import NotificationPanel from '../NotificationPanel/Notification';
import { useEffect, useState, useCallback } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { NavLink } from 'react-router-dom';

// Modern, ultra-light initials helper
const getInitials = (name) =>
  name
    ?.trim()
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .toUpperCase();

// --- Mobile-Optimized Shimmer Components ---
const ShimmerText = () => (
  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
);

const ShimmerAvatar = () => (
  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
);

const usePersistentFetch = (url, storageKey) => {
  const [state, setState] = useState(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        return { data: JSON.parse(cached), loading: false, error: null };
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
    return { data: null, loading: true, error: null };
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch(url, { method: "GET", credentials: "include" });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const result = await response.json();
        if (isMounted) {
          setState(prev => {
            const isDataDifferent = JSON.stringify(prev.data) !== JSON.stringify(result);
            if (isDataDifferent || prev.loading || prev.error) {
               localStorage.setItem(storageKey, JSON.stringify(result));
               return { data: result, loading: false, error: null };
            }
            return prev;
          });
        }
      } catch (err) {
        if (isMounted) {
          setState(prev => ({ ...prev, error: prev.data ? null : err, loading: false }));
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [url, storageKey]);

  return state;
};

function Header() {
  const { data: userData, loading: userLoading } = usePersistentFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/auth/getuser`,
    'header_auth_user'
  );

  const { data: showProfileData } = usePersistentFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/profile/getprofile`,
    'header_user_profile'
  );

  const { data: chapterNameData, loading: chapterLoading } = usePersistentFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/getchapteroverview`,
    'header_chapter_overview'
  );

  const url = showProfileData?.profile_image_url || null;
  const currentChapterName = chapterNameData?.chapterName || "Chapter";

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className="
        relative z-[100]
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
        text-gray-900 dark:text-gray-100
        flex justify-between items-center 
        transition-all duration-300
        px-4 min-h-[70px] border-b border-gray-100 dark:border-gray-800
        shadow-sm
      "
    >
      <div className="flex items-center gap-3">
        <Sidebar />

        <div className="relative group">
           <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
           <Zoom>
             <img
               src="/assets/logo.webp"
               alt="logo"
               className="w-[42px] h-[42px] object-contain rounded-full relative z-10"
             />
           </Zoom>
        </div>

        <NavLink to={'/dashboard'} className="flex flex-col">
          <h1 className="text-[14px] font-black tracking-tight text-gray-900 dark:text-white leading-none">
            SIB APP
          </h1>
          <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mt-1">
            Official
          </span>
        </NavLink>
      </div>

      <div className="flex items-center gap-3">
        {/* Chapter Name / Loading */}
        <div className="flex flex-col items-end mr-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
            Chapter
          </span>
          {chapterLoading ? (
             <ShimmerText /> 
          ) : (
            <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
              {getInitials(currentChapterName)}
            </span>
          )}
        </div>

        {/* Notifications & Avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-100 dark:border-gray-800">
          <NotificationPanel />

          <div className="flex-shrink-0 ml-1">
            {userLoading ? (
              <ShimmerAvatar />
            ) : userData ? (
              <HeaderAvatar
                src={url}
                initials={getInitials(userData.username)}
                Name={userData.username}
                status={userData.status === true ? "online" : "offline"}
                email={userData.email}
              />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;