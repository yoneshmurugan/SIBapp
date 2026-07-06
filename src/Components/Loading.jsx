import React from 'react';

function Loading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 animate-pulse">
      {/* Title Placeholder */}
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
      
      {/* Main Number Placeholder */}
      <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
      
      {/* Subtext Placeholder */}
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
      
      {/* Stats Row Placeholder */}
      <div className="w-full flex justify-between gap-4 mt-auto">
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

export default Loading;