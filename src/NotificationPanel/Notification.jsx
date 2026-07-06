import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, CheckCheck, X, ChevronRight, Info } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { NavLink } from "react-router-dom";

function formatTime(iso) {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return "Just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function Notification() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const detailRef = useRef(null);
  const [activeNotif, setActiveNotif] = useState(null);

  const {
    data: listData,
    loading: listLoading,
    error: listError,
  } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/notification/getallnotifications`,
    { method: "GET", credentials: "include" }
  );

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (Array.isArray(listData)) {
      setNotifications(listData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  }, [listData]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const toggle = () => setOpen((o) => !o);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const focusable = panelRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
      if (e.key === "Tab" && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusables = Array.from(nodes);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const markAllRead = async () => {
    const prev = notifications;
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/readallnotifications`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await res.json();
    } catch (e) {
      console.log(e);
      setNotifications(prev);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/deleteallnotifications`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setNotifications([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const patchReadById = async (id) => {
    const datetime = new Date().toISOString().replace("Z", "+00:00");
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_SERVER}/notification/updatenotificationbyid/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true, readAt: datetime }),
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  };

  const openDetails = async (n) => {
    setActiveNotif(n);
    setDetailOpen(true);
    setOpen(false);

    if (!n.read) {
      const prev = notifications;
      setNotifications((prevList) =>
        prevList.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );

      try {
        await patchReadById(n._id);
      } catch {
        setNotifications(prev);
      }
    }
  };

  useEffect(() => {
    if (!detailOpen) return;

    const focusable = detailRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setDetailOpen(false);
        requestAnimationFrame(() => panelRef.current?.focus?.());
      }
      if (e.key === "Tab" && detailRef.current) {
        const nodes = detailRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusables = Array.from(nodes);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [detailOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="notification-panel"
        onClick={toggle}
        className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          id="notification-panel"
          role="dialog"
          aria-label="Notifications"
          aria-modal="true"
          className="fixed inset-x-4 top-[70px] sm:absolute sm:inset-auto sm:-right-2 sm:top-14 sm:w-[380px] z-50 origin-top-right rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl focus:outline-none transform transition-all animate-in fade-in slide-in-from-top-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3 bg-white/50 dark:bg-gray-900/50 rounded-t-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllRead}
                title="Mark all as read"
                className="rounded-full p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={listLoading || !!listError || unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearAll}
                title="Clear all"
                className="rounded-full p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={listLoading || !!listError || notifications.length === 0}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
              <button
                onClick={close}
                title="Close"
                aria-label="Close notifications"
                className="rounded-full p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <ul className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {listLoading && (
              <li className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fetching notifications...</p>
              </li>
            )}
            
            {listError && (
              <li className="px-4 py-8 text-center">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load</p>
                <p className="text-xs text-gray-500 mt-1">Please try again later.</p>
              </li>
            )}
            
            {!listLoading && !listError && notifications.length === 0 && (
              <li className="px-4 py-10 text-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">You're all caught up!</p>
                <p className="text-xs text-gray-500 mt-1">No new notifications at the moment.</p>
              </li>
            )}

            {!listLoading && !listError && notifications.slice(0, 10).map((n) => (
              <li key={n._id} className="relative group">
                <button
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/80 ${
                    !n.read 
                      ? "bg-amber-50/30 dark:bg-amber-900/10" 
                      : "bg-white dark:bg-transparent"
                  }`}
                  onClick={() => openDetails(n)}
                >
                  <div className="mt-1 flex-shrink-0">
                    {!n.read ? (
                      <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                    ) : (
                      <span className="flex h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm mb-0.5 truncate pr-2 ${!n.read ? "font-semibold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"}`}>
                      {n.header}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {n.content}
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                </button>
                <div className="absolute bottom-0 left-12 right-4 h-px bg-gray-100 dark:bg-gray-800/60 group-last:hidden"></div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          {!listLoading && !listError && notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 p-2 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl">
              <NavLink
                to='/allnotifications'
                className="flex items-center justify-center w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                onClick={close}
              >
                View all notifications
                <ChevronRight className="w-4 h-4 ml-1" />
              </NavLink>
            </div>
          )}
        </div>
      )}

      {/* Details Modal overlay */}
      {detailOpen && activeNotif && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Notification details"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetailOpen(false);
          }}
        >
          <div
            ref={detailRef}
            className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl outline-none transform animate-in zoom-in-95 duration-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  Notification
                </h4>
              </div>
              <button
                className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setDetailOpen(false)}
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="px-5 py-6">
              <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {activeNotif.header}
              </h5>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap border border-gray-100 dark:border-gray-700/50 max-h-[50vh] overflow-y-auto">
                {activeNotif.content}
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                {formatTime(activeNotif.createdAt)}
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-gray-800">
              <button
                className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                onClick={() => setDetailOpen(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
