import { useState, useEffect } from "react";
import EntryField from "../Components/EntryField";
import TextArea from "../Components/TextArea";
import FilterButton from "../Members/Components/FilterButton";
import { getDate } from '../utils/getDate.mjs';
import { X, Users, MapPin, Camera, MessageSquare, Calendar, Loader2, ChevronDown } from "lucide-react";

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

const SearchableMobileSelect = ({ label, placeholder, options, value, onChange, disabled, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedOption = options.find(o => o.value === value);

  const filteredOptions = options.filter(o => 
     o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (o.subtitle && o.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col items-start w-full gap-1">
      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
        {label}
      </label>
      <div 
        className={`relative w-full rounded-xl border ${isOpen ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-amber-200 dark:border-gray-700'} bg-white px-4 py-3.5 text-gray-800 text-sm dark:bg-gray-800 dark:text-gray-100 transition-all cursor-pointer flex justify-between items-center ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : 'hover:border-amber-400 shadow-sm'}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
         <span className={selectedOption ? "text-gray-900 dark:text-white font-semibold truncate pr-2" : "text-gray-400 dark:text-gray-500 truncate pr-2"}>
            {loading ? "Loading..." : selectedOption ? selectedOption.title : placeholder}
         </span>
         <ChevronDown size={18} className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4" onClick={() => setIsOpen(false)}>
           <div 
             className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[75vh] shadow-2xl border-t border-gray-100 dark:border-gray-800" 
             onClick={e => e.stopPropagation()}
           >
              <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                 <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="px-5 pb-4 pt-2 sm:pt-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                 <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{label}</h3>
                 <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><X size={20}/></button>
              </div>
              <div className="p-4 border-b border-gray-50 dark:border-gray-800/50 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
                 <input 
                   autoFocus
                   type="text" 
                   placeholder={`Search ${label.toLowerCase()}...`} 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white shadow-sm"
                 />
              </div>
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar overscroll-contain">
                 {filteredOptions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                       <span className="text-2xl">🔍</span>
                       No results found for "{searchTerm}"
                    </div>
                 ) : (
                    <div className="flex flex-col gap-1.5">
                      {filteredOptions.map((opt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                             onChange(opt.value);
                             setIsOpen(false);
                             setSearchTerm("");
                          }}
                          className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex flex-col ${value === opt.value ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800/80 border border-transparent'}`}
                        >
                           <span className={`font-semibold text-base ${value === opt.value ? 'text-amber-700 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                             {opt.title}
                           </span>
                        </button>
                      ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

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

  // New Dropdown States
  const [crossChapter, setCrossChapter] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(false);

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

  // Fetch Dropdown Data
  useEffect(() => {
    let cancelled = false;
    const fetchInitial = async () => {
      try {
        if (!crossChapter) {
          // Fetch own chapter members
          setDropdownLoading(true);
          const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/getallmemberships`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          const data = await res.json();
          if (!cancelled && Array.isArray(data)) {
            const list = data.map((m) => ({
              username: m.user?.username || "",
              display_name: m.display_name || m.user?.name || "",
              chapter: m.chapter?.chapter_name || "",
              chapter_id: m.chapter?._id || ""
            })).filter(m => m.username);
            setAvailableMembers(list);
          }
          if (!cancelled) setDropdownLoading(false);
        } else {
          // Fetch chapters
          if (availableChapters.length === 0) {
            setChaptersLoading(true);
            const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/main/getallchapters`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            const data = await res.json();
            if (!cancelled && Array.isArray(data)) {
              setAvailableChapters(data);
            }
            if (!cancelled) setChaptersLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setDropdownLoading(false);
          setChaptersLoading(false);
        }
      }
    };
    fetchInitial();
    return () => { cancelled = true; };
  }, [crossChapter, availableChapters.length]);

  // When cross chapter is enabled and a chapter is selected, fetch members
  useEffect(() => {
    let cancelled = false;
    if (crossChapter && selectedChapter) {
      const fetchCrossMembers = async () => {
        setDropdownLoading(true);
        try {
           const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/getallmemberships?chapter_id=${selectedChapter}`, {
             method: "GET",
             headers: { "Content-Type": "application/json" },
             credentials: "include",
           });
           const data = await res.json();
           if (!cancelled && Array.isArray(data)) {
              const list = data.map((m) => ({
                username: m.user?.username || "",
                display_name: m.display_name || m.user?.name || "",
                chapter: m.chapter?.chapter_name || "",
                chapter_id: m.chapter?._id || ""
              })).filter(m => m.username);
              setAvailableMembers(list);
           }
        } catch(err) {
           console.error(err);
        } finally {
           if (!cancelled) setDropdownLoading(false);
        }
      };
      fetchCrossMembers();
    } else if (crossChapter && !selectedChapter) {
      setAvailableMembers([]);
    }
    return () => { cancelled = true; };
  }, [crossChapter, selectedChapter]);

  const handleImageChange = async (e) => {
    setImageError(null);
    const originalFile = e.target.files[0];
    if (!originalFile) return;

    if (originalFile.size > 20 * 1024 * 1024) {
        setImageError("File is too large. Please upload an image smaller than 20MB.");
        return;
    }

    try {
      setImageUploading(true);
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
      if (err.message === "Failed to fetch") {
        setImageError("Network error or file too large. Please try a smaller image.");
      } else {
        setImageError(err.message || "Image upload failed.");
      }
    } finally {
      setImageUploading(false);
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
        header: `🤝 M2M Meeting Scheduled with ${formData.created_by_username}`,
        content: `Hi there! ${formData.created_by_username} has scheduled a new Member-to-Member (M2M) meeting with you.\n\nTopic: ${formData.discussion_points}\n\nLet's grow together!`,
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
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-4">
               <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <Calendar size={16} className="text-amber-500" />
                 Meeting Logistics
               </h3>
               
               {/* Cross Chapter Toggle */}
               <div className="flex items-center gap-3 bg-stone-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-stone-100 dark:border-gray-800 w-fit">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cross Chapter</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={crossChapter} onChange={(e) => {
                        setCrossChapter(e.target.checked);
                        setMember2Name("");
                        setChapterName("");
                        setSelectedChapter("");
                    }} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                  </label>
               </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <EntryField
                placeholder={username}
                label="Member 1 (You)"
                readOnly={true}
                type="text"
                value={username}
                className="bg-gray-50 dark:bg-gray-800"
              />

              {crossChapter ? (
                 <SearchableMobileSelect
                   label="Partner's Chapter *"
                   placeholder="Select Chapter"
                   loading={chaptersLoading}
                   disabled={chaptersLoading}
                   value={selectedChapter}
                   onChange={(val) => {
                      setSelectedChapter(val);
                      const selectedChap = availableChapters.find(c => c._id === val);
                      if (selectedChap) {
                        setChapterName(selectedChap.chapter_name);
                      }
                      setMember2Name("");
                   }}
                   options={availableChapters.map(chap => ({
                      value: chap._id,
                      title: chap.chapter_name
                   }))}
                 />
              ) : (
                 <div className="flex flex-col items-start w-full gap-1">
                   <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                     Partner's Chapter
                   </label>
                   <div className="relative w-full">
                     <input
                       type="text"
                       readOnly={true}
                       value={chapterName || "Same Chapter"}
                       className="block w-full rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 text-gray-500 text-sm dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 cursor-not-allowed"
                     />
                   </div>
                 </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <SearchableMobileSelect
                label="Member 2 (Partner) *"
                placeholder={crossChapter && !selectedChapter ? "Select a chapter first" : "Select Member"}
                loading={dropdownLoading}
                disabled={dropdownLoading || (crossChapter && !selectedChapter)}
                value={member2Name}
                onChange={(val) => {
                   setMember2Name(val);
                   if (!crossChapter) {
                      const mem = availableMembers.find(m => m.username === val);
                      if (mem && mem.chapter) setChapterName(mem.chapter);
                   }
                }}
                options={availableMembers.map(mem => ({
                   value: mem.username,
                   title: mem.display_name ? `${mem.username} (${mem.display_name})` : mem.username
                }))}
              />

              <EntryField
                type="date"
                placeholder="Date"
                label="Date *"
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
               <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
                  Upload Photo *
               </span>
               
               {imageUploading && (
                  <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
                     <span className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                       <Loader2 className="animate-spin" size={20} /> Optimizing & Uploading...
                     </span>
                  </div>
               )}

               <div className="flex flex-col sm:flex-row gap-3">
                 <label className="flex-1 flex flex-col items-center justify-center py-4 px-4 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl cursor-pointer transition-colors border border-amber-200 dark:border-amber-800">
                    <Camera size={24} className="mb-2" />
                    <span className="text-sm font-semibold">Take Photo</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" disabled={loading || imageUploading} onChange={handleImageChange} />
                 </label>
                 <label className="flex-1 flex flex-col items-center justify-center py-4 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer transition-colors border border-gray-200 dark:border-gray-700">
                    <svg className="mb-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-semibold">Gallery</span>
                    <input type="file" accept="image/*" className="hidden" disabled={loading || imageUploading} onChange={handleImageChange} />
                 </label>
               </div>
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

          <div className="flex w-full justify-end">
            <FilterButton
              content={loading ? "Submitting..." : "Submit Slip"}
              bg="bg-gradient-to-r from-amber-400 to-yellow-500 dark:from-amber-600 dark:to-yellow-600"
              hover="hover:from-amber-500 hover:to-yellow-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              onClick={handleSubmit}
              loading={loading}
              className="flex-1 px-4 sm:px-8 py-3.5 text-white font-semibold transform transition hover:-translate-y-0.5 rounded-xl sm:rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ButtonPage;