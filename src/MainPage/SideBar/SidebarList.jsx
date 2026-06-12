import * as Icons from "lucide-react";
import { NavLink } from 'react-router-dom';

// Special portal items get distinct accent colors
const PORTAL_STYLES = {
  "/presidentportal": {
    accent: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-50 dark:bg-violet-900/30",
    activeBorder: "border-violet-200 dark:border-violet-800",
    iconColor: "text-violet-500 dark:text-violet-400",
    dot: "bg-violet-500",
    label: "PRESIDENT",
  },
  "/coordinatorsportal": {
    accent: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-50 dark:bg-emerald-900/30",
    activeBorder: "border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "COORDINATOR",
  },
  "/memberdetailedanalytics": {
    accent: "text-blue-600 dark:text-blue-400",
    activeBg: "bg-blue-50 dark:bg-blue-900/30",
    activeBorder: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500 dark:text-blue-400",
    dot: "bg-blue-500",
    label: "ANALYTICS",
  },
};

function SidebarList({ onclick, name, icon, path = '/', index = 0 }) {
  const Icon = Icons[(icon || "").charAt(0).toUpperCase() + (icon || "").slice(1)] || Icons.Circle;
  const portal = PORTAL_STYLES[path];

  return (
    <li style={{ animationDelay: `${index * 40}ms` }} className="animate-in fade-in slide-in-from-top-1 duration-200 fill-mode-both">
      <NavLink
        to={path}
        role="menuitem"
        onClick={onclick}
        className={({ isActive }) => `
          relative flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium
          rounded-xl border transition-all duration-150 active:scale-[0.97]
          ${isActive
            ? portal
              ? `${portal.activeBg} ${portal.activeBorder} ${portal.accent}`
              : "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
            : "border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        `}
      >
        {({ isActive }) => (
          <>
            {/* Active indicator bar */}
            {isActive && (
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${portal ? portal.dot : "bg-amber-500"}`}
              />
            )}

            {/* Icon */}
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${
                isActive
                  ? portal ? portal.iconColor : "text-amber-600 dark:text-amber-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />

            {/* Label */}
            <span className="flex-1 truncate text-[13px] leading-tight">{name.trim()}</span>

            {/* Portal badge */}
            {portal && (
              <span
                className={`text-[8px] font-black tracking-[0.12em] px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? `${portal.dot.replace("bg-", "bg-")} text-white`
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                }`}
              >
                {portal.label}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}

export default SidebarList;
