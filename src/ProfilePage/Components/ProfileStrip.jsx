import { Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { CompletionRing } from "./CompletionRing";
import { Share } from '@capacitor/share'; // Added Capacitor Share import

const ProfileStrip = ({
  name = "Refresh Page",
  email = "Kindly update your profile...",
  avatarUrl = null,
  shareText = "I'm excited to share my professional profile with you! Please check it out to know more about my background, expertise, and how we can connect or collaborate.",
  user_id = "",
  chapter = "",
  profile_id = "",
  editable = false,
  completionPercentage = 0
}) => {
  const [copied, setCopied] = useState(false);
  const [initials, setInitials] = useState("");
  const [url, setUrl] = useState("");
  const [avatar, setAvatar] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInitials(getInitials(name));
  }, [name]);

  useEffect(() => {
    const origin = window.location.origin;
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

  // Updated handleShare for Capacitor Native support
  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: shareText,
      url: url,
      dialogTitle: 'Share Profile' // Native prompt title
    };

    try {
      // 1. Check if Capacitor Share is available (Native iOS/Android)
      const canShare = await Share.canShare();
      
      if (canShare.value) {
        await Share.share(shareData);
      } 
      // 2. Fallback to standard Web API (if running as PWA/Web)
      else if (navigator.share) {
        await navigator.share(shareData);
      } 
      // 3. Final fallback: Copy to clipboard (Desktop browsers)
      else {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // Ignore errors caused by the user closing the share sheet manually
      if (err.message !== 'Share canceled') {
         console.error("Error sharing:", err);
      }
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
    <div className="w-full rounded-2xl border border-sky-200 bg-gradient-to-r from-white to-amber-100 dark:from-gray-800 dark:to-gray-700 shadow-sm my-2">
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 rounded-xl bg-red-500 md:h-16 md:w-16 transition-all">
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold dark:text-gray-200">
              {avatar ? (
                <img
                  src={avatar}
                  alt="ProfilePhoto"
                  className="h-full w-full border-x-fuchsia-100 rounded-xl object-cover"
                  loading="lazy"
                />
              ) : initials}
            </span>
            {editable &&
              <button
                type="button"
                onClick={openFileSelector}
                className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white text-white shadow bg-cyan-500 hover:bg-cyan-600 dark:border-gray-800"
                aria-label="Edit profile photo"
                title="Change Photo"
                disabled={uploading}
              >
                {uploading
                  ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            }
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
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-gray-100 line-clamp-2 md:line-clamp-1">
              {name}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
              {email}
            </p>
          </div>
        </div>
        <div className="flex flex-row-reverse items-center justify-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-500"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-slate-500 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
                <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
              </svg>
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
          <span className=" text-sm text-slate-700 dark:text-gray-300 sm:inline">
            {chapter || ""}
          </span>
          {editable && <CompletionRing percentage={completionPercentage} />}
        </div>
      </div>
      {uploadError && (
        <div className="px-4 pb-2 text-xs text-red-600 dark:text-red-300">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default ProfileStrip;