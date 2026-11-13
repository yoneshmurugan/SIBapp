import React from "react";
import { KeyRound, Bell, Shield } from "lucide-react";

const items = [
  { key: "security", label: "Security & Password", icon: KeyRound },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "privacy", label: "Privacy Policy", icon: Shield },
];

export default function SettingsSidebar({ active, onChange }) {
  return (
    <nav
      aria-label="Settings sections"
      className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 shadow-xl backdrop-blur-md"
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3 py-2">
        Settings Menu
      </h2>
      <ul className="space-y-1.5 mt-1">
        {items.map((it) => {
          const isActive = active === it.key;
          const Icon = it.icon;
          return (
            <li key={it.key}>
              <button
                type="button"
                onClick={() => onChange(it.key)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-gray-950" : "text-amber-500"}`} />
                <span>{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
