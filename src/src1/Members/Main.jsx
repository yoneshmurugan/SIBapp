import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, ChevronDown, MapPin, SlidersHorizontal, X, Check } from 'lucide-react';
import MemberCard from './MemberCard';
import HalfPageLoader from '../../Members/Components/Loader';

// Custom Mobile-Friendly Dropdown (Prevents screen overflow)
const CustomSelect = ({ label, value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl transition-all active:scale-95"
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300 truncate pr-2">
          {value}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full max-h-60 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[12px] font-bold transition-colors ${
                  value === opt 
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="truncate">{opt}</span>
                {value === opt && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function Main({
  data, totalCount, loading, error,
  region, setRegion, regions,
  chapter, setChapter, chapters,
  vertical, setVertical, verticals,
  sort, setSort,
  search, setSearch,
  onChange, onClear
}) {
  const debounceTimeout = useRef(null);

  const sorts = ["Name A-Z", "Name Z-A", "Chapter", "Region"];

  useEffect(() => {
    onChange({ region, chapter, vertical, sort, search });
  }, [region, chapter, vertical, sort, search]);

  const clearAllFilters = () => {
    onClear({ region: "All Regions", chapter: "All Chapters", vertical: "All Verticals", sort: "Name A-Z", search: "" });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => setSearch(value), 300);
  };

  const MemberGrid = useMemo(() => {
    if (data.length === 0) return null;
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-500">
        {data.map((member, index) => (
          <MemberCard key={member._id || index} member={member} />
        ))}
      </div>
    );
  }, [data]);

  return (
    <div className="w-full max-w-full">
      <section className="mb-8 space-y-4 px-1">
        
        {/* Search */}
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search directory..."
            className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-[14px] font-medium focus:ring-2 focus:ring-amber-500/20 transition-all dark:text-white shadow-sm"
            defaultValue={search}
            onChange={handleSearchChange}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Custom Dropdowns (2 columns) */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <CustomSelect label="Region" value={region} options={regions} onChange={setRegion} icon={RefreshCw} />
          <CustomSelect label="Vertical" value={vertical} options={verticals} onChange={setVertical} icon={SlidersHorizontal} />
          <div className="col-span-2">
            <CustomSelect label="Sort" value={sort} options={sorts} onChange={setSort} icon={ChevronDown} />
          </div>
        </div>

        {/* Chapters Scroll */}
        <div className="space-y-2 pt-2 w-full">
          <div className="flex items-center gap-2 px-1">
            <MapPin className="w-3 h-3 text-rose-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chapters</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {chapters.map((c) => (
              <button
                key={c}
                onClick={() => setChapter(c)}
                className={`px-4 py-2.5 rounded-full text-[11px] font-bold whitespace-nowrap border-2 transition-all ${
                  chapter === c 
                    ? "bg-amber-400 border-amber-400 text-amber-950 shadow-md" 
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 border-t border-gray-50 dark:border-gray-800/50 mt-2">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data.length} Matched</span>
           <button onClick={clearAllFilters} className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">Clear All</button>
        </div>
      </section>

      <section className="w-full min-h-[400px]">
        {loading ? <div className="flex justify-center py-20"><HalfPageLoader /></div> : data.length > 0 ? MemberGrid : <div className="py-20 text-center"><Search className="w-8 h-8 text-gray-200 mx-auto mb-4" /><p className="text-gray-500 text-sm font-bold">No results found</p></div>}
      </section>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default Main;