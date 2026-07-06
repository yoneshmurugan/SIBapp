import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, X, ChevronDown } from "lucide-react";

// Format raw field names into readable labels
const formatField = (key) => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Dob", "Date of Birth")
    .replace("Elevator Pitch 30s", "30-Sec Pitch");
};

export const CompletionBadge = ({ percentage = 0, missingFields = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isComplete = percentage >= 100;

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Interactive Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 overflow-hidden rounded-full py-1.5 pl-3 pr-2 shadow-sm transition-all active:scale-95 ${
          isComplete
            ? "bg-green-100 dark:bg-green-900/30 ring-1 ring-green-200 dark:ring-green-800/50"
            : "bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        {/* Progress Background fill */}
        {!isComplete && (
          <div
            className="absolute left-0 top-0 bottom-0 bg-amber-100 dark:bg-amber-900/20 transition-all duration-1000 ease-out z-0"
            style={{ width: `${percentage}%` }}
          />
        )}

        <div className="relative z-10 flex items-center gap-1.5">
          {isComplete ? (
            <>
              <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
              <span className="text-[11px] font-black text-green-700 dark:text-green-300 tracking-wider">
                100% COMPLETE
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 tracking-wider">
                {percentage}% PROFILE
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </div>
      </button>

      {/* Modal for missing fields */}
      {!isComplete && isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 border-b border-amber-100 dark:border-amber-900/50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <AlertCircle size={18} />
                  <h3 className="text-base font-black">Profile Incomplete</h3>
                </div>
                <p className="text-xs font-semibold text-amber-700/80 dark:text-amber-400/80 mt-1">
                  You are missing {missingFields.length} field{missingFields.length !== 1 ? 's' : ''}. Fill them out to reach 100%!
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 active:scale-95 transition-all"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-3 bg-white dark:bg-gray-900">
              <ul className="space-y-1.5">
                {missingFields.map((field) => (
                  <li
                    key={field}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 shadow-sm" />
                    {formatField(field)}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-[13px] hover:bg-gray-300 dark:hover:bg-gray-700 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
