function DateField({ handler, value }) {
  return (
    <label className="date-item">
      <input
        type="date"
        value={value}
        onChange={(e) => handler(e.target.value)}
        name="activity-type"
        className="
          rp-input
          border-2 border-gray-300 dark:border-gray-600
          mx-4 px-2 rounded-xl
          font-semibold text-md h-[40px]
          text-gray-700 dark:text-gray-200
          bg-white dark:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500
          transition-colors duration-300
        "
      />
    </label>
  );
}

export default DateField;
