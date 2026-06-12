import { useState, useEffect } from "react";
import { List } from "lucide-react";
import Activity from "./Components/Activity";

function FullActivity( {data = [], onAction} ) {
  const [visibleCount, setVisibleCount] = useState(20);

  // Reset visible count when data filter changes
  useEffect(() => {
    setVisibleCount(20);
  }, [data]);

  const visibleData = data.slice(0, visibleCount);

  const ActivityComponents = visibleData.map((activity , index) => {
    return (<Activity content={activity} key={index} onAction={onAction}/>)
  });

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-stone-100 dark:border-gray-800 p-4 sm:p-6 shadow-sm dark:shadow-none transition-colors duration-300 flex flex-col h-full max-h-[800px]">
      <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4 shrink-0">
         <List size={16} className="text-amber-500" />
         Recent Activity
      </h2>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
             <p className="text-sm font-semibold">No activity found for this period.</p>
          </div>
        ) : (
          <>
            {ActivityComponents}
            {visibleCount < data.length && (
              <button
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="w-full py-3 mt-4 mb-2 rounded-xl border border-stone-200 dark:border-gray-700 bg-stone-50 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
              >
                Load More Activities ({data.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FullActivity;
