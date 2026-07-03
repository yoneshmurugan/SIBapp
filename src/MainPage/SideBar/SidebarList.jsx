import * as Icons from "lucide-react";
import { NavLink } from 'react-router-dom';

function SidebarList({
  onClick, 
  name,
  icon,
  path = '/',
  highlight = false
}) {
  const Icon = Icons[(icon || "").charAt(0).toUpperCase() + (icon || "").slice(1)] || Icons.Code;

  return (
    <li className={highlight ? "mt-1 mb-1" : ""}>
      <NavLink
        to={path}
        role="menuitem"
        onClick={onClick}
        className={({ isActive }) => `
          flex w-full items-center gap-2 px-3 py-2 text-sm rounded-2xl transition-all duration-300
          ${highlight 
            ? "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-900 dark:text-amber-400 font-bold border border-amber-300/50 dark:border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:scale-[1.02]" 
            : isActive 
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
              : "text-gray-700 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-500/20"
          }
        `}
      >
        <Icon className={`h-4 w-4 ${highlight ? "text-amber-600 dark:text-amber-400" : "text-gray-600 dark:text-gray-400"}`} />
        <span>{name}</span>
        {highlight && (
          <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
        )}
      </NavLink>
    </li>
  );
}

export default SidebarList;
