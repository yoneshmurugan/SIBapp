function Checkbox({ state, update, content }) {
  return (
    <label className="inline-flex items-center gap-3">
      <input
        type="checkbox"
        checked={state}
        onChange={(e) => update(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
      />
      <span className="text-sm text-gray-700 dark:text-gray-200">{content}</span>
    </label>
  );
}

export default Checkbox;