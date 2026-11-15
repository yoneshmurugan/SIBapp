import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, ChevronDown, MapPin, SlidersHorizontal, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import MemberCard from './MemberCard';
import HalfPageLoader from '../../Members/Components/Loader';

const ITEMS_PER_PAGE = 20;

function getPaginationRange(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - 1, 1);
  const rightSibling = Math.min(current + 1, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 2;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 4;
    return [...Array.from({ length: leftItemCount }, (_, i) => i + 1), "...", total];
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 4;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1);
    return [1, "...", ...rightRange];
  }

  if (showLeftDots && showRightDots) {
    return [1, "...", leftSibling, current, rightSibling, "...", total];
  }

  return Array.from({ length: total }, (_, i) => i + 1);
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const sorts = ["Name A-Z", "Name Z-A", "Chapter", "Region"];

  useEffect(() => {
    onChange({ region, chapter, vertical, sort, search });
  }, [region, chapter, vertical, sort, search]);

  // Reset to page 1 whenever filters or data length change
  useEffect(() => {
    setCurrentPage(1);
  }, [region, chapter, vertical, sort, search, data.length]);

  // Bounds safeguard
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const clearAllFilters = () => {
    onClear({ region: "All Regions", chapter: "All Chapters", vertical: "All Verticals", sort: "Name A-Z", search: "" });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => setSearch(value), 300);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentMembers = useMemo(
    () => data.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [data, startIndex]
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const paginationRange = useMemo(
    () => getPaginationRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const MemberGrid = useMemo(() => {
    if (currentMembers.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500 w-full place-items-center">
        {currentMembers.map((member, index) => (
          <MemberCard key={member._id || index} member={member} />
        ))}
      </div>
    );
  }, [currentMembers]);

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
        {loading ? (
          <div className="flex justify-center py-20"><HalfPageLoader /></div>
        ) : data.length > 0 ? (
          <>
            {MemberGrid}

            {/* Sliding Ellipsis Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                  Showing <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span>–
                  <span className="font-bold text-gray-900 dark:text-white">{Math.min(startIndex + ITEMS_PER_PAGE, data.length)}</span> of{" "}
                  <span className="font-bold text-gray-900 dark:text-white">{data.length}</span> members
                </span>

                <div className="flex items-center justify-center gap-1 sm:gap-1.5 order-1 sm:order-2 flex-wrap">
                  {/* Prev Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Page Numbers with Sliding Ellipsis */}
                  {paginationRange.map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`dots-${idx}`}
                          className="px-2 py-1 text-gray-400 dark:text-gray-500 font-bold select-none text-xs"
                        >
                          ...
                        </span>
                      );
                    }

                    const isCurrent = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`min-w-[36px] h-9 px-2.5 rounded-xl text-xs font-black transition-all ${
                          isCurrent
                            ? "bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20 scale-105"
                            : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center"><Search className="w-8 h-8 text-gray-200 mx-auto mb-4" /><p className="text-gray-500 text-sm font-bold">No results found</p></div>
        )}
      </section>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default Main;