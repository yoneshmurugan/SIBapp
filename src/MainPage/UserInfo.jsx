import useFetch from '../hooks/useFetch';
import { User, Settings, Building2, Share2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function UserInfo() {
  const { data, loading, error } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/profile/getprofile`, 
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (loading) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-0 shadow-sm animate-pulse h-60 w-full overflow-hidden border border-gray-100 dark:border-gray-800">
       <div className="h-20 bg-gray-200 dark:bg-gray-800/50"></div>
       <div className="px-6 pt-2">
          <div className="-mt-10 h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-900"></div>
          <div className="mt-4 h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          <div className="mt-2 h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-3/4"></div>
          <div className="mt-6 flex gap-2">
             <div className="h-9 flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
             <div className="h-9 flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          </div>
       </div>
    </div>
  );

  // Safely extract data
  const isProfileFound = data && !data.message;
  // Fallback to display_name if username is not in user object, or "Guest User"
  const username = isProfileFound ? (data.user?.username || data.display_name) : "Guest User";
  const companyName = isProfileFound ? (data.company_name || "Company Not Set") : "Join a Chapter";
  const email = isProfileFound ? data.user?.email : "";
  const avatarUrl = isProfileFound ? data.profile_image_url : null;
  const initial = username ? username.charAt(0).toUpperCase() : "U";
  const verticals = isProfileFound && Array.isArray(data.vertical_names) ? data.vertical_names : [];
  const profileId = isProfileFound ? data._id : null;

  const handleShare = async () => {
    const shareUrl = profileId
      ? `https://senguntharinbusiness.com/profile/${profileId}`
      : "https://senguntharinbusiness.com";
    const shareText = `Check out ${username}'s profile on SIB!`;

    try {
      // Try Capacitor Share first (native Android)
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: `${username} - SIB Profile`,
        text: shareText,
        url: shareUrl,
        dialogTitle: 'Share Profile',
      });
    } catch {
      // Fallback to Web Share API
      if (navigator.share) {
        try {
          await navigator.share({ title: `${username} - SIB`, text: shareText, url: shareUrl });
          return;
        } catch {}
      }
      // Last resort: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('Profile link copied to clipboard!');
      } catch {}
    }
  };

  return (
    <div className="
      group
      bg-white dark:bg-gray-900 
      rounded-2xl 
      shadow-md hover:shadow-xl dark:shadow-gray-900/50
      border border-gray-100 dark:border-gray-800
      overflow-hidden
      transition-all duration-300
      flex flex-col
    ">
      {/* Decorative Banner */}
      <div className="h-20 bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 dark:from-amber-700 dark:via-orange-800 dark:to-red-900 relative">
         <div className="absolute inset-0 bg-white/10 dark:bg-black/10"></div>
         {/* Small share icon top-right of banner */}
         <button
           onClick={handleShare}
           className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors active:scale-90"
           title="Share profile"
         >
           <Share2 size={14} className="text-white" />
         </button>
      </div>

      <div className="px-5 pb-5 relative">
         {/* Avatar overlapping the banner */}
         <div className="absolute -top-8 left-5">
            <div className="
              w-16 h-16 
              rounded-full 
              border-[4px] border-white dark:border-gray-900 
              bg-white dark:bg-gray-800 
              flex items-center justify-center
              shadow-sm
              overflow-hidden
            ">
               {avatarUrl ? (
                  <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
               ) : (
                  <span className="text-2xl font-bold text-amber-500 dark:text-amber-400 select-none">
                    {initial}
                  </span>
               )}
            </div>
         </div>

         {/* Text Content */}
         <div className="pt-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
              {username}
            </h2>
            
            <div className="flex items-center gap-1.5 mt-1.5 text-amber-600 dark:text-amber-400">
               <Building2 size={14} strokeWidth={2.5} />
               <p className="text-sm font-bold truncate">
                 {companyName}
               </p>
            </div>

            {/* Verticals Tags */}
            {verticals.length > 0 && (
               <div className="flex flex-wrap gap-1.5 mt-2">
                  {verticals.map((vertical, index) => (
                     <span 
                        key={index} 
                        className="
                           inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                           bg-amber-50 dark:bg-amber-900/20 
                           text-amber-700 dark:text-amber-300
                           border border-amber-100 dark:border-amber-800/50
                        "
                     >
                        {vertical}
                     </span>
                  ))}
               </div>
            )}
            
            {email && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 truncate">
                {email}
              </p>
            )}
         </div>

         {/* Action Buttons */}
         <div className="grid grid-cols-2 gap-2 mt-6">
            <NavLink to="/profile" className="
              flex items-center justify-center gap-2 px-3 py-2 
              rounded-xl 
              bg-gray-50 dark:bg-gray-800 
              text-gray-700 dark:text-gray-200
              hover:bg-amber-50 dark:hover:bg-gray-700 
              hover:text-amber-600 dark:hover:text-amber-400
              border border-transparent hover:border-amber-200 dark:hover:border-gray-600
              text-sm font-semibold 
              transition-all duration-200 active:scale-95
            ">
              <User size={15} /> 
              <span>Profile</span>
            </NavLink>
            
            <NavLink to="/settings" className="
              flex items-center justify-center gap-2 px-3 py-2 
              rounded-xl 
              bg-gray-50 dark:bg-gray-800 
              text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-700 
              hover:text-gray-900 dark:hover:text-white
              border border-transparent hover:border-gray-200 dark:hover:border-gray-600
              text-sm font-semibold 
              transition-all duration-200 active:scale-95
            ">
              <Settings size={15} /> 
              <span>Settings</span>
            </NavLink>
         </div>
      </div>
    </div>
  );
}

export default UserInfo;