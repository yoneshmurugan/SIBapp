import React from 'react';
import { Calendar, MapPin, Clock, Info, CheckCircle2, XCircle } from 'lucide-react';

function Meeting({ content = {}, header = false }) {
  // If it's a header call from the old layout, return nothing to remove the table header
  if (header) return null;

  const isPresent = content.status === "present";

  return (
    <div className="group relative flex flex-col w-full bg-white dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Decorative side accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      {/* Header: Date & Status */}
      <div className="flex justify-between items-start mb-4 pl-2">
        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-1">
            {content.meetingType} Meeting
          </p>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
            {content.title || "Untitled Meeting"}
          </h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
          isPresent 
            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
            : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
        }`}>
          {isPresent ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {isPresent ? "Present" : "Absent"}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 mt-auto">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Calendar size={16} className="text-gray-400" />
          <span className="font-medium">{content.meetingDate || "No Date"}</span>
        </div>
        
        {content.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock size={16} className="text-gray-400" />
            <span className="font-medium">{content.duration}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 sm:col-span-2">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <span className="font-medium truncate">{content.location || "No Location"}</span>
        </div>
      </div>
    </div>
  );
}

export default Meeting;
