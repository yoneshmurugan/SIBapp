import ActivityBadge from "./ActivityBadge";
import { ModalViewer } from "./ViewContentModal";
import { CalendarDays, User, ArrowRightLeft, AlignLeft, Info } from "lucide-react";

function Activity({ content, onAction }) {
  if (!content) return null;

  return (
    <div className="flex flex-col gap-3 p-4 bg-stone-50 hover:bg-stone-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/80 rounded-2xl border border-stone-200 dark:border-gray-700/50 transition-all duration-300 relative group">
      
      {/* Top Header: Date & Type */}
      <div className="flex justify-between items-center w-full gap-2">
         <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs font-bold uppercase tracking-tight">
            <CalendarDays size={13} className="text-amber-500" />
            {content.date}
         </div>
         <div className="flex items-center gap-1 shrink-0">
            <ActivityBadge content={content.type} />
            <ActivityBadge content={content.status} />
         </div>
      </div>

      {/* Middle: Member & Direction */}
      <div className="flex flex-col gap-1">
         <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            {content.name}
         </h3>
         <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
            <ArrowRightLeft size={14} className={content.direction === "Given" ? "text-red-400" : "text-emerald-500"} />
            <span className={content.direction === "Given" ? "text-red-500 font-semibold" : "text-emerald-500 font-semibold"}>
              {content.direction}
            </span>
         </div>
      </div>

      {/* Bottom: Details */}
      <div className="bg-white dark:bg-gray-900/50 rounded-xl p-3 border border-stone-100 dark:border-gray-800 flex flex-col gap-1">
         <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <AlignLeft size={14} /> Details
         </div>
         <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {content.detail}
         </p>
      </div>

      {/* View Modal Action */}
      <div className="absolute right-4 bottom-4">
         <ModalViewer content={content.fullDetails} onAction={onAction} />
      </div>
    </div>
  );
}

export default Activity;
