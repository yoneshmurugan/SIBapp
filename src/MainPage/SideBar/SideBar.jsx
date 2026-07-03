import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SidebarList from './SidebarList';
import useFetch from "../../hooks/useFetch";

export default function HeaderAvatar({
  items: initialItems = [
    { name: "Dashboard", icon: "House", path: "/dashboard" },
    { name: "My Activity", icon: "TrendingUp", path: "/myactivity" },
    { name: "Members Directory", icon: "users", path: "/members" },
    { name: "Meetings", icon: "calendar", path: "/meetings" },
    // { name: "Chapter Info", icon: "building2", path: "/mychapter" },
    { name: "Referral Slips", icon: "fileText", path: "/slips" },
    { name: "Notifications", icon: "messageSquareDot", path: "/allnotifications" },
    { name: "Wall of Wishes", icon: "gift", path: "/wall-of-wishes" },
    { name: "Leaderboard", icon: "award", path: "/leaderboard", highlight: true }
  ]
}) {
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

  useEffect(() => {
    setItems(prev => {
      let next = [...initialItems];
      
      if (coordinatorsAccess?.hasaccess || access?.hasaccess) {
        if (!next.some(e => e.path === "/memberdetailedanalytics")) {
          next.push({ name: "Members Analytics", icon: "chartLine", path: "/memberdetailedanalytics" });
        }
        if (!next.some(e => e.path === "/coordinatorsportal")) {
          next.push({ name: "Coordinators Portal", icon: "users", path: "/coordinatorsportal" });
        }
      }

      if (access?.hasaccess) {
        if (!next.some(e => e.path === "/presidentportal")) {
          next.push({ name: "President Portal", icon: "users", path: "/presidentportal" });
        }
      }

      return next;
    });
  }, [coordinatorsAccess, access]);

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleMenuItemClick = () => setOpen(false);

  return (
    <div className="relative z-10">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => {
          if (["Enter", " "].includes(e.key)) {
            e.preventDefault();
            setOpen(v => !v);
          }
        }}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Toggle sidebar menu"
      >
        <Menu className="text-gray-700 dark:text-gray-200" size={24} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="
            absolute left-0 mt-2 w-56
            rounded-lg border border-neutral-300 dark:border-gray-600
            bg-white dark:bg-gray-800
            shadow-2xl
            max-h-[70vh] overflow-y-auto
            transition-all duration-200
            animate-in fade-in zoom-in-95
          "
        >
          <ul className="py-2 px-1">
            {items.map(element => (
              <SidebarList
                key={element.path}
                name={element.name}
                icon={element.icon}
                path={element.path}
                highlight={element.highlight}
                onClick={handleMenuItemClick}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
