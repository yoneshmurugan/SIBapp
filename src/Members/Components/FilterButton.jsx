function FilterButton({ content, onClick, bg = "bg-white", hover = "hover:bg-gray-200", className = "" , loading = false}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded-2xl ${bg} ${hover} text-sm font-medium shadow-sm ${className}` + (loading ? " cursor-not-allowed opacity-70" : "")}
      type="button"
      disabled={loading}
    >
      {content}
    </button>
  );
}

export default FilterButton;