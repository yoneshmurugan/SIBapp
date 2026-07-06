import React from "react";

const items = [
  { key: "security", label: "Security" },
  { key: "notifications", label: "Notifications" },
  { key: "privacy", label:"Privacy"},
];

export default function SettingsSidebar({ active, onChange }) {
  return (
    <nav
      aria-label="Settings sections"
      className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm"
    >
      <h2 className="font-semibold my-4 text-slate-900 dark:text-gray-100">Select Here</h2>
      <ul className="space-y-1">
        {items.map((it) => {
          const isActive = active === it.key;
          return (
            <li key={it.key}>
              <button
                type="button"
                onClick={() => onChange(it.key)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 ${
                  isActive
                    ? "bg-amber-400 font-semibold text-black dark:text-gray-900"
                    : "text-slate-700 hover:bg-amber-300 dark:text-gray-300 dark:hover:bg-amber-500/50"
                } focus:ring-slate-200 dark:focus:ring-gray-500`}
              >
                {it.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
