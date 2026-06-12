import { useEffect } from "react";
import Filter from "./Components/Filter";
import Checkbox from "./Components/Checkbox";
import FilterButton from "./Components/FilterButton";
import { useRef } from "react";

export default function DirectoryFilters({
  region, setRegion,
  chapter, setChapter,
  vertical, setVertical,
  myChapterOnly, setMyChapterOnly,
  sort, setSort,
  search, setSearch,
  regions = ["All Regions", "North", "South", "East", "West"],
  chapters = ["All Chapters", "Alpha", "Beta", "Gamma"],
  verticals = ["All Verticals", "Engineering", "Design", "Marketing"],
  sorts = ["Name A-Z", "Name Z-A", "Chapter", "Region"],
  onChange = () => { },
  onClear = () => { },
  onExport = () => { },
}) {
  useEffect(() => {
    onChange({
      region, chapter, vertical, myChapterOnly, sort, search
    });
  }, [region, chapter, vertical, myChapterOnly, sort, search]);

  const clear = () => {
    const reset = {
      region: regions[0],
      chapter: chapters[0],
      vertical: verticals[0],
      sort: sorts[0],
      myChapterOnly: false,
      search: "",
    };
    setRegion(reset.region);
    setChapter(reset.chapter);
    setVertical(reset.vertical);
    setSort(reset.sort);
    setMyChapterOnly(reset.myChapterOnly);
    setSearch(reset.search);
    onClear?.(reset);
  };

  // Debounce search input
  const debounceTimeout = useRef();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setSearch(value);
    }, 500);
  };

  return (
    <section className="w-full bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300 mb-4">
      {/* Search Bar - Most prominent on mobile */}
      <div className="relative w-full mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-sm font-semibold placeholder-gray-400"
          placeholder="Search members or verticals..."
          defaultValue={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Filters Grid - 2 columns on mobile to save vertical space */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Filter name="Region" state={region} update={setRegion} content={regions} />
        <Filter name="Chapter" state={chapter} update={setChapter} content={chapters} />
        <Filter name="Vertical" state={vertical} update={setVertical} content={verticals} />
        <Filter name="Sort by" state={sort} update={setSort} content={sorts} />
      </div>

      {/* Actions and Checkbox */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="w-full sm:w-auto">
          <Checkbox state={myChapterOnly} update={setMyChapterOnly} content="Show My Chapter Only" />
        </div>
        
        <div className="flex w-full sm:w-auto gap-2">
          <button
            onClick={clear}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-[12px] font-bold uppercase tracking-wider active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            onClick={onExport}
            className="flex-1 sm:flex-none px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-[12px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-sm"
          >
            Export
          </button>
        </div>
      </div>
    </section>
  );
}
