import { useEffect, useRef, useState } from "react";
import SidebarList from "../SideBar/SidebarList";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import classNames from "../../utils/classname";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; 
import { Preferences } from "@capacitor/preferences";

// --- ADD THIS IMPORT ---
import { CapacitorCookies } from '@capacitor/core';
// -----------------------

export function HeaderAvatar({
  src = "../../../public/assets/19.jpg",
  alt = "User avatar",
  initials = "UA",
  status = "online",
  email = "user@example.com",
  onProfile,
  Name = "Default",
  onSettings,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const logoutUrl = `${import.meta.env.VITE_BACKEND_SERVER}/auth/sessionLogout`;
  const logoutOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  async function onLogout() {
    try {
      setLoading(true);

      // 1. Tell backend to destroy the session
      await fetch(logoutUrl, logoutOptions).catch(() => console.log("Backend logout ping failed, continuing local wipe..."));

      // 2. Destroy the Native iOS Bearer Token
      await Preferences.remove({ key: 'sib_session_token' });

      // 3. Destroy the Web Bearer Token
      window.localStorage.removeItem('sib_session_token');

      // 4. NUKE THE NATIVE APPLE COOKIE JAR (The missing link!)
      await CapacitorCookies.clearAllCookies();

      // 5. Destroy the Firebase SDK Session
      try {
        await signOut(auth);
      } catch (fbError) {
        console.warn("Firebase sign out silent error:", fbError);
      }

      // 6. Force navigate to the main page
      navigate("/");

    } catch (error) {
      console.error(`Logout Error: ${error.message}`);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false);
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

  const statusColor = {
    online: "bg-emerald-500",
    offline: "bg-neutral-400",
    busy: "bg-rose-500",
    away: "bg-amber-500",
    null: "bg-transparent",
  }[status ?? "null"];

  return (
    <div className="relative cursor">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="
          group inline-flex items-center gap-2 rounded-full
          p-1.5 hover:bg-yellow-100/10 active:bg-yellow-200
          transition focus:outline-none focus:ring-2 focus:ring-yellow-300
        "
      >
        <span className="relative inline-block h-9 w-9 rounded-full overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-600">
          {src ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-medium text-black bg-amber-400 dark:text-white">
              {initials}
            </span>
          )}
          {status && (
            <span
              className={classNames(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900",
                statusColor
              )}
              aria-hidden="true"
            />
          )}
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="
            absolute right-0 mt-2 w-56
            rounded-lg border border-neutral-200 dark:border-neutral-700
            bg-white dark:bg-gray-800 shadow-lg
            overflow-hidden max-h-[70vh] overflow-y-auto
          "
        >
          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-700">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{Name}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{email}</p>
          </div>

          <ul className="py-1">
            <SidebarList onclick={onProfile} name={"Profile"} icon={"User"} path="/profile" />
            <SidebarList onclick={onSettings} name={"Settings"} icon={"Settings"} path="/settings" />
          </ul>

          <div className="border-t border-neutral-100 dark:border-neutral-700">
            <button
              role="menuitem"
              onClick={onLogout}
              disabled={loading}
              className={classNames(
                "flex w-full items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-700/20 transition",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 text-rose-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>{loading ? "Logging out..." : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}