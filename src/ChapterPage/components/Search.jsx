import { Search } from "lucide-react";

function SearchInput({ value, onChange }) {
  return (
    <div className="flex items-center w-full md:w-60 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3">
      <Search className="text-gray-700 dark:text-gray-300 mr-2 w-4 h-4" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Member"
        className="outline-none w-full placeholder-gray-400 dark:placeholder-gray-300 text-sm text-gray-900 dark:text-gray-100 bg-transparent"
      />
    </div>
  );
}

export default SearchInput;
