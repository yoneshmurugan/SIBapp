import { Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { CompletionBadge } from "./CompletionBadge";
import { Share } from "@capacitor/share";

const ProfileStrip = ({
  name = "Refresh Page",
  email = "Kindly update your profile...",
  avatarUrl = null,
  shareText = "I'm excited to share my professional profile with you! Please check it out to know more about my background, expertise, and how we can connect or collaborate.",
  user_id = "",
  chapter = "",
  profile_id = "",
  editable = false,
  completionPercentage = 0,
  missingFields = []
}) => {
  const [copied, setCopied] = useState(false);
  const [initials, setInitials] = useState("");
  const [url, setUrl] = useState("");
  const [avatar, setAvatar] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInitials(getInitials(name));
  }, [name]);

  useEffect(() => {
    const origin = "https://senguntharinbusiness.com";
    const path = "/profile/" + profile_id + "?user=" + user_id;
    setUrl(`${origin}${path}`);
  }, [user_id, profile_id]);

  useEffect(() => {
    setAvatar(avatarUrl);
  }, [avatarUrl]);

  function getInitials(name) {
    return name
      .trim()
      .split(' ')
      .map(n => n[0] || '')
      .join('')
      .toUpperCase();
  }

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: shareText,
      url: url,
      dialogTitle: 'Share Profile', // Useful for Android 
    };

    try {
      // Check if sharing is supported on this device/platform
      const canShareResult = await Share.canShare();

      if (canShareResult.value) {
        await Share.share(shareData);
      } else {
        // Fallback to clipboard if native/web share is unavailable
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
      // Optional: If the share dialog was dismissed or failed, you could uncomment below to force clipboard copy
      /*
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardErr) {
        console.error("Clipboard backup failed", clipboardErr);
      }
      */
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handleFileInput = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const uploadRes = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/auth/upload/photo`,
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );
      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { url: imageUrl } = await uploadRes.json();
      if (!imageUrl) throw new Error("Server did not return photo URL");

      const updateRes = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/profile/updateprofile`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_image_url: imageUrl })
        }
      );
      if (!updateRes.ok) throw new Error("Profile update failed");
      const updatedProfile = await updateRes.json();

      setAvatar(updatedProfile.profile_image_url || imageUrl);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative w-full rounded-3xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg mt-2 mb-4 group">
      {/* Background layer with overflow-hidden to contain the glow effects but not the dropdowns */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl opacity-50 dark:bg-amber-600/10" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full bg-orange-400/20 blur-3xl opacity-50 dark:bg-orange-600/10" />
      </div>

      <div className="relative z-10 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between bg-gradient-to-br from-white/60 to-transparent dark:from-gray-900/60 backdrop-blur-sm rounded-3xl">
        <div className="flex min-w-0 items-center gap-5">
          <div 
            className={`relative h-20 w-20 shrink-0 rounded-full bg-gradient-to-tr from-amber-200 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 p-1 shadow-inner md:h-24 md:w-24 transition-transform duration-300 group-hover:scale-105 cursor-pointer hover:ring-2 hover:ring-amber-400`}
            onClick={() => setShowImagePreview(true)}
          >
            <span className="absolute inset-0 flex items-center justify-center text-amber-700 font-bold dark:text-amber-400 text-lg">
              {avatar ? (
                <img
                  src={avatar}
                  alt="ProfilePhoto"
                  className="h-full w-full rounded-full object-cover"
                  loading="lazy"
                />
              ) : initials}
            </span>
            <input
              id="avatar-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={handleFileInput}
            />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white line-clamp-1 leading-none mb-1.5">
              {name}
            </h1>
            <p className="text-[13px] font-semibold text-amber-600 dark:text-amber-400 truncate mb-1">
              {chapter || "SIB Member"}
            </p>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">
              {email}
            </p>
          </div>
        </div>
        
        <div className="flex flex-row-reverse items-center justify-between gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/50 rounded-2xl p-2.5 px-3 shadow-inner">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-1.5 text-[12px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-gray-400 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
              </svg>
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {editable && <CompletionBadge percentage={completionPercentage} missingFields={missingFields} />}
          </div>
        </div>
      </div>
      {uploadError && (
        <div className="px-4 pb-2 text-xs text-red-600 dark:text-red-300">
          {uploadError}
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowImagePreview(false)}
          />
          
          <div className="relative w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowImagePreview(false)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl mb-8 bg-gray-800 flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl font-bold text-white/50">{initials}</span>
              )}
            </div>

            {editable && (
              <button
                onClick={() => {
                  setShowImagePreview(false);
                  setTimeout(openFileSelector, 100);
                }}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3.5 bg-white text-gray-900 rounded-full font-bold shadow-xl active:scale-95 transition-all hover:bg-gray-50"
              >
                {uploading ? (
                  <svg className="animate-spin h-5 w-5 text-amber-500" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <Upload className="h-5 w-5 text-amber-500" />
                )}
                {uploading ? "Uploading..." : "Upload New Photo"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileStrip;