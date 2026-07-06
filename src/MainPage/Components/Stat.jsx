import React from 'react';

function Stat({ value, label, money = false }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 text-center transition-transform duration-300 hover:scale-105">
      <h2 className="text-xl sm:text-2xl font-bold text-amber-500 dark:text-amber-400 tracking-tight">
        {money ? `₹${value}` : value}
      </h2>
      <h3 className="mt-1 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </h3>
    </div>
  );
}

export default Stat;