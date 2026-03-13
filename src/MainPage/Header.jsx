import { HeaderAvatar } from './Components/Avatar';
import Sidebar from './SideBar/SideBar';
import NotificationPanel from '../NotificationPanel/Notification';
import Loader from '../Members/Components/Loader';
import ErrorComponent from '../Components/ErrorComponent';
import CircularLoading from '../Components/CircularLoading';
import { useEffect, useState, useCallback } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { NavLink } from 'react-router-dom';

const getInitials = (name) =>
  name
    ?.trim()
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .toUpperCase();

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
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

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
          setState(prev => ({
            ...prev,
            error: prev.data ? null : err, 
            loading: false
          }));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, storageKey]);

  return state;
};

function Header() {
  const { data: userData, loading: userLoading, error: userError } = usePersistentFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/auth/getuser`,
    'header_auth_user'
  );

  const { data: showProfileData } = usePersistentFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/profile/getprofile`,
    'header_user_profile'
  );

  const { data: chapterNameData, loading: chapterLoading, error: chapterError } = usePersistentFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/getchapteroverview`,
    'header_chapter_overview'
  );

  const url = showProfileData?.profile_image_url || null;
  const currentChapterName = chapterNameData?.chapterName || "Chapter Name";

  return (
    <div
      className="
        sticky top-0 z-50 w-full
        bg-white dark:bg-gray-900
        text-gray-900 dark:text-gray-100
        
        /* MAGIC FIX: Subtracting 12px from the safe area to pull the contents upward */
        pt-[calc(env(safe-area-inset-top)_-_12px)]
        
        pb-2 px-2 
        shadow-sm
        flex justify-between items-center 
        transition-colors duration-300
        rounded-b-lg sm:rounded-b-xl lg:rounded-b-2xl
      "
    >
      {/* Restored Original Sizes and Gaps */}
      <div className="flex flex-row items-center mt-1 pl-2 gap-3">
        <Sidebar />

        <Zoom>
          <img
            src="/assets/logo.webp"
            alt="logo"
            className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] object-contain rounded-full"
            style={{
              background: "none",
              display: "inline-block",
              verticalAlign: "middle",
            }}
          />
        </Zoom>

        <NavLink to={'/dashboard'}>
          <h1
            className="
            font-bold text-base sm:text-lg
            text-gray-800 dark:text-gray-100
            hidden sm:inline-block
          "
          >
            SENGUNTHAR IN BUSINESS
          </h1>
        </NavLink>
      </div>

      <div className="flex flex-row items-center justify-end gap-3 p-2 mx-2 sm:mx-4">
        <span className="
          text-gray-700 dark:text-gray-300 font-bold text-sm sm:text-base 
          md:inline-block truncate max-w-[100px] sm:max-w-xs
        ">
          {chapterLoading ? (
             <Loader /> 
          ) : chapterError ? (
             <ErrorComponent />
          ) : (
            <>
              <span className="md:hidden">
                {getInitials(currentChapterName)}
              </span>
              <span className="hidden md:inline">
                {currentChapterName}
              </span>
            </>
          )}
        </span>

        <NotificationPanel />

        <div className="flex-shrink-0">
          {userLoading ? (
            <CircularLoading />
          ) : userError ? (
            <ErrorComponent />
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
  );
}

export default Header;