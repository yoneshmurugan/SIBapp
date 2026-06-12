import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

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

function CrossChapterSearch({
  value,
  onChange,
  placeholder = "Select a member",
  label = "To *",
  userstate = null,
  offsubmit = false // kept for backwards compatibility but we now use a toggle switch
}) {
  const [crossChapter, setCrossChapter] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // Fetch Dropdown Data
  useEffect(() => {
    let cancelled = false;
    const fetchInitial = async () => {
      try {
        if (!crossChapter) {
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
              chapter_id: m.chapter?._id || "",
              rawUser: { ...m.user, phone_number: m.company_phone || m.user?.phone_number }
            })).filter(m => m.username);
            setAvailableMembers(list);
          }
          if (!cancelled) setDropdownLoading(false);
        } else {
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
                chapter_id: m.chapter?._id || "",
                rawUser: { ...m.user, phone_number: m.company_phone || m.user?.phone_number }
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

  const handleMemberChange = (val) => {
     onChange(val);
     const mem = availableMembers.find(m => m.username === val);
     if (mem && userstate && mem.rawUser) {
        userstate(mem.rawUser);
     }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {offsubmit !== true && (
        <div className="flex items-center gap-3 bg-stone-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-stone-100 dark:border-gray-800 w-fit">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cross Chapter</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={crossChapter} onChange={(e) => {
                setCrossChapter(e.target.checked);
                onChange("");
                setSelectedChapter("");
            }} />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
          </label>
        </div>
      )}

      {crossChapter && (
         <SearchableMobileSelect
           label="Select Chapter *"
           placeholder="Select Chapter"
           loading={chaptersLoading}
           disabled={chaptersLoading}
           value={selectedChapter}
           onChange={(val) => {
              setSelectedChapter(val);
              onChange("");
           }}
           options={availableChapters.map(chap => ({
              value: chap._id,
              title: chap.chapter_name
           }))}
         />
      )}

      <SearchableMobileSelect
        label={label}
        placeholder={crossChapter && !selectedChapter ? "Select a chapter first" : placeholder}
        loading={dropdownLoading}
        disabled={dropdownLoading || (crossChapter && !selectedChapter)}
        value={value}
        onChange={handleMemberChange}
        options={availableMembers.map(mem => ({
           value: mem.username,
           title: mem.display_name ? `${mem.username} (${mem.display_name})` : mem.username
        }))}
      />
    </div>
  );
}

export default CrossChapterSearch;