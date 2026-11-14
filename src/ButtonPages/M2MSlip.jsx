import { useState, useEffect } from "react";
import CrossChapterSearch from "../Components/CrossSearch";
import EntryField from "../Components/EntryField";
import TextArea from "../Components/TextArea";
import FilterButton from "../Members/Components/FilterButton";
import { getDate } from '../utils/getDate.mjs';
import { X, Users, MapPin, Camera, MessageSquare, Calendar, Loader2 } from "lucide-react";

// --- Utility: Client-Side Image Compression ---
const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // If file is small (< 1MB), return as is
    if (file.size < 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty"));
              return;
            }
            // Create a new File object with the compressed blob
            const newFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

function ButtonPage({ onClose = () => {} }) {
  const todaysDate = getDate();

  const [chapterName, setChapterName] = useState("");
  const [date, setDate] = useState(todaysDate);
  const [location, setLocation] = useState("");
  const [conversationTopic, setConversationTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false); // Separate loader for image
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [member2Name, setMember2Name] = useState("");
  const [username, setUsername] = useState("loading...");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/auth/getuser`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch user");
        const user = await res.json();
        if (!cancelled && user?.username) {
          setUsername(user.username);
        }
      } catch (e) {
        console.error(e);
        setUsername("Unknown");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleImageChange = async (e) => {
    setImageError(null);
    const originalFile = e.target.files[0];
    if (!originalFile) return;

    // Optional: Hard block really massive files (e.g., > 20MB) even before compression attempts
    if (originalFile.size > 20 * 1024 * 1024) {
        setImageError("File is too large. Please upload an image smaller than 20MB.");
        return;
    }

    try {
      setImageUploading(true);
      
      // 1. Compress the image before uploading
      // This reduces a 10MB photo to ~300KB usually, preventing server rejections
      const processedFile = await compressImage(originalFile);

      const formData = new FormData();
      formData.append("photo", processedFile);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/auth/upload/photo`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      // Handle server responding with an error (e.g., 413 or 500)
      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const data = await res.json();
      if (data?.url) {
        setImageUrl(data.url);
      } else {
        setImageError(data?.error || "Image upload failed.");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      // Friendly error message for fetch failures
      if (err.message === "Failed to fetch") {
        setImageError("Network error or file too large. Please try a smaller image.");
      } else {
        setImageError(err.message || "Image upload failed.");
      }
    } finally {
      setImageUploading(false);
      // Reset input value to allow re-uploading same file if failed
      e.target.value = null; 
    }
  };

  const validateForm = () => {
    if (!member2Name) return "Please select Member 2.";
    if (!chapterName) return "Please select a Chapter.";
    if (!date) return "Please select a date.";
    if (!location) return "Please enter the meeting location.";
    if (!conversationTopic) return "Please enter the topic of conversation.";
    if (!imageUrl) return "Please upload an image.";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = {
      member2_name: member2Name,
      chapter_name: chapterName,
      meeting_date: date,
      location: location,
      discussion_points: conversationTopic,
      created_by_username: username,
      status: false,
      image_url: imageUrl,
    };

    try {
      setLoading(true);
      // Send notification
      const notificationData = {
        receiver: formData.member2_name,
        sender: formData.created_by_username,
        header: `Upcoming Member-to-Member (M2M) Meeting ${formData.created_by_username}`,
        content: `This is to notify you about the scheduled Member-to-Member (M2M) meeting by the user ${formData.created_by_username}. Topic of conversation: ${formData.discussion_points}`,
        read: false,
      };
      await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createnotification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notificationData),
          credentials: "include",
        }
      );
      // Submit slip
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/slips/one2one/createone2one`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      const result = await res.json();
      if (result?.errors ) {
        const errMsg = result?.errors?.[0]
          ? `${result?.errors?.[0].path} : ${result?.errors?.[0].msg}`
          : (result?.message || "An error occurred.");
        setError(errMsg);
      } else {
        setResponse("Slip submitted successfully!");
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-2 sm:p-4 min-h-screen bg-stone-50/50 dark:bg-black/20">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-100 dark:border-gray-800 flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-gray-800 dark:to-gray-900 p-5 sm:p-8 flex justify-between items-center border-b border-amber-100 dark:border-gray-800 shrink-0">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
              <Users size={24} className="sm:w-7 sm:h-7" />
            </span>
            SIB M to M Slip
          </h2>
          <button
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
          
          {/* Section 1: Meeting Details */}
          <section className="space-y-4">
             <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-4">
              <Calendar size={16} className="text-amber-500" />
              Meeting Logistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <EntryField
                placeholder={username}
                label="Member 1 (You)"
                readOnly={true}
                type="text"
                value={username}
                className="bg-gray-50 dark:bg-gray-800"
              />
              <CrossChapterSearch
                label="Member 2 (Partner) *"
                placeholder="Search a member"
                value={member2Name}
                onChange={setMember2Name}
                userstate={(user) => {
                  if (user?.chapter || user?.chapter_name) {
                    setChapterName(user.chapter || user.chapter_name);
                  }
                }}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <EntryField
                type="text"
                placeholder="Auto-filled from Member 2 (or enter chapter)"
                label="Chapter *"
                value={chapterName}
                onChange={setChapterName}
              />
              <EntryField
                type="date"
                placeholder="Date"
                label="Date"
                value={date}
                onChange={setDate}
              />
             </div>
             <div className="pt-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-amber-500" />
                  Location
                </h3>
               <EntryField
                type="text"
                placeholder="Where did you meet?"
                label=""
                value={location}
                onChange={setLocation}
              />
             </div>
          </section>

          {/* Section 2: Discussion */}
          <section className="bg-stone-50 dark:bg-gray-800/30 p-4 sm:p-6 rounded-2xl border border-stone-100 dark:border-gray-800 space-y-4">
             <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} className="text-amber-500" />
              Conversation
            </h3>
            <TextArea
              label="Topic of conversation *"
              placeholder="Briefly describe the topics discussed..."
              value={conversationTopic}
              onChange={setConversationTopic}
              className="bg-white dark:bg-gray-900 min-h-[100px]"
            />
          </section>

          {/* Section 3: Proof of Meeting */}
          <section className="space-y-4">
             <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Camera size={16} className="text-amber-500" />
              Proof of Meeting
            </h3>
            <div className={`p-4 border-2 border-dashed rounded-xl transition-colors ${imageUploading ? "bg-amber-50 border-amber-300" : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-amber-50/50 dark:hover:bg-gray-800/50"}`}>
              <label className="block w-full cursor-pointer relative">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Upload Photo *
                </span>
                
                {imageUploading && (
                  <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
                     <span className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                       <Loader2 className="animate-spin" size={20} /> Optimizing & Uploading...
                     </span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:bg-amber-100 file:text-amber-700
                    hover:file:bg-amber-200
                    dark:file:bg-amber-900/30 dark:file:text-amber-400
                    cursor-pointer disabled:opacity-50"
                  disabled={loading || imageUploading}
                  onChange={handleImageChange}
                />
              </label>
              {imageUrl && (
                <div className="mt-4 relative group w-fit">
                  <img src={imageUrl} alt="Meeting Proof" className="h-32 w-auto object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg"></div>
                </div>
              )}
              {imageError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                   <X size={12} /> {imageError}
                </p>
              )}
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 text-center animate-pulse">
              {String(error)}
            </div>
          )}

          {response && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 text-center">
              {String(response)}
            </div>
          )}

          <div className="flex w-full justify-end gap-3 sm:gap-4">
            <FilterButton
              content="Cancel"
              bg="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              hover="hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-8 py-3 text-gray-600 dark:text-gray-300 shadow-sm"
            />
            <FilterButton
              content={loading ? "Submitting..." : "Submit Slip"}
              bg="bg-gradient-to-r from-amber-400 to-yellow-500 dark:from-amber-600 dark:to-yellow-600"
              hover="hover:from-amber-500 hover:to-yellow-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              onClick={handleSubmit}
              loading={loading}
              className="flex-1 sm:flex-none px-4 sm:px-8 py-3 text-white font-semibold transform transition hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );  
}

export default ButtonPage;