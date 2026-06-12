function Filter({ name, state, update, content = [] }) {
  return (
    <label className="flex flex-col w-full">
      <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 pl-1">{name}</span>
      <select
        value={state}
        onChange={(e) => update(e.target.value)}
        className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] font-bold text-gray-800 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
      >
        {content.map((c, i) => (
          <option key={c._id || i} value={c._id || c}>{c.region_name || c}</option>
        ))}
      </select>
    </label>
  );
}

export default Filter;