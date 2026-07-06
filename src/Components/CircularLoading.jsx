const CircularLoading = () => {
  return (
    <div
      className="flex items-center justify-center min-h-16"
      role="status"
      aria-label="Loading"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default CircularLoading;
