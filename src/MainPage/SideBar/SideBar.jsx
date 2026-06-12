import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SidebarList from './SidebarList';
import useFetch from "../../hooks/useFetch";

const DEFAULT_ITEMS = [
  { name: "Dashboard",         icon: "House",           path: "/dashboard" },
  { name: "My Activity",       icon: "TrendingUp",      path: "/myactivity" },
  { name: "Members Directory", icon: "Users",           path: "/members" },
  { name: "Meetings",          icon: "Calendar",        path: "/meetings" },
  { name: "Referral Slips",    icon: "FileText",        path: "/slips" },
  { name: "Notifications",     icon: "MessageSquareDot",path: "/allnotifications" },
];

export default function SideBar({ items: initialItems = DEFAULT_ITEMS }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const { data: access } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/caneditevents`,
    { method: "GET", credentials: "include" }
  );
  const { data: coordinatorsAccess } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/coordinatoraccess`,
    { method: "GET", credentials: "include" }
  );

  // Add coordinator items
  useEffect(() => {
    if (!coordinatorsAccess?.hasaccess) return;
    setItems(prev => {
      if (prev.some(e => e.path === "/coordinatorsportal")) return prev;
      return [
        ...prev,
        { name: "Members Analytics",  icon: "ChartLine",  path: "/memberdetailedanalytics" },
        { name: "Coordinators Portal", icon: "ShieldCheck", path: "/coordinatorsportal" },
      ];
    });
  }, [coordinatorsAccess]);

  // Add president items (superset of coordinator)
  useEffect(() => {
    if (!access?.hasaccess) return;
    setItems(prev => {
      if (prev.some(e => e.path === "/presidentportal")) return prev;
      // Remove coordinator-only entries if president is adding their own superset
      const base = prev.filter(e => e.path !== "/memberdetailedanalytics" && e.path !== "/coordinatorsportal");
      return [
        ...base,
        { name: "Members Analytics",  icon: "ChartLine",  path: "/memberdetailedanalytics" },
        { name: "President Portal",   icon: "Crown",       path: "/presidentportal" },
        { name: "Coordinators Portal", icon: "ShieldCheck", path: "/coordinatorsportal" },
      ];
    });
  }, [access]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = e => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative z-50">
      {/* Hamburger button */}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 active:scale-90"
        aria-label="Toggle navigation menu"
      >
        {open
          ? <X className="text-gray-700 dark:text-gray-200" size={22} />
          : <Menu className="text-gray-700 dark:text-gray-200" size={22} />
        }
      </button>

      {/* Overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Dropdown panel */}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="
            absolute left-0 top-[calc(100%+8px)] z-50
            w-[240px]
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-800
            rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.18em]">Navigation</p>
          </div>

          {/* Nav items */}
          <ul className="p-2 space-y-0.5 max-h-[70vh] overflow-y-auto">
            {items.map((element, i) => (
              <SidebarList
                key={element.path}
                name={element.name}
                icon={element.icon}
                path={element.path}
                onclick={() => setOpen(false)}
                index={i}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
