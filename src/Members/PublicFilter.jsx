import { useEffect, useMemo, useCallback } from "react";
import Filter from "./Components/Filter";
import FilterButton from "./Components/FilterButton";
import debounce from "lodash/debounce";
import { UserSearch } from "lucide-react";

const SORT_OPTIONS = ["Name A-Z", "Name Z-A", "Chapter", "Region"];

export default function PublicFilters({
  filters,
  regions,
  chapters,
  verticals,
  onChange,
  onClear,
  onExport,
}) {
  const { region, chapter, vertical, searchterm, sort } = filters;

  /* ---------------------------------------
     Immediate change (non-search filters)
  ---------------------------------------- */
  useEffect(() => {
    onChange({
      region,
      chapter,
      vertical,
      sort,
    });
  }, [region, chapter, vertical, sort, onChange]);

  /* ---------------------------------------
     Debounced search
  ---------------------------------------- */
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        onChange({ searchterm: value });
      }, 500),
    [onChange]
  );

  useEffect(() => {
    debouncedSearch(searchterm);
    return () => debouncedSearch.cancel();
  }, [searchterm, debouncedSearch]);

  /* ---------------------------------------
     Handlers
  ---------------------------------------- */
  const handleClear = useCallback(() => {
    onClear();
  }, [onClear]);

  return (
    <section
      className="w-full rounded-3xl bg-white dark:bg-gray-800 p-4 md:p-6
                 shadow-2xl border border-gray-200 dark:border-gray-700"
      aria-label="Directory filters"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Filter
          name="Region"
          state={region}
          update={(v) => onChange({ region: v })}
          content={regions}
        />
        <Filter
          name="Chapter"
          state={chapter}
          update={(v) => onChange({ chapter: v })}
          content={chapters}
        />
        <Filter
          name="Vertical"
          state={vertical}
          update={(v) => onChange({ vertical: v })}
          content={verticals}
        />
        <Filter
          name="Sort by"
          state={sort}
          update={(v) => onChange({ sort: v })}
          content={SORT_OPTIONS}
        />
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2"><UserSearch className="dark:text-amber-50" />
          <input
            type="text"
            className="border rounded-3xl px-3 py-2 w-full md:w-64 bg-gray-200 border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Search members/verticals..."
            value={searchterm}
            onChange={(e) => onChange({ searchterm: e.target.value })}
          />
        </div>


        <div className="flex gap-3 md:justify-end">
          <FilterButton
            content="Clear Filter"
            onClick={handleClear}
            bg="bg-white dark:bg-gray-300"
            hover="hover:bg-gray-200 dark:hover:bg-gray-400"
          />
          <FilterButton
            content="Export Directory"
            onClick={onExport}
            bg="bg-yellow-300 dark:bg-yellow-500"
            hover="hover:bg-yellow-400 dark:hover:bg-yellow-600"
          />
        </div>
      </div>
    </section>
  );
}
