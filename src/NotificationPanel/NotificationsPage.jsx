import { useState, useEffect, useRef } from "react";
import useFetch from "../hooks/useFetch";
import Header from "../MainPage/Header";
import { Bell, Info, X, Calendar, User, AlignLeft, CheckCircle2 } from "lucide-react";

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
    return d.toLocaleString([], {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

export default function NotificationsPage() {
  const [showDetail, setShowDetail] = useState(false);
  const [activeNotif, setActiveNotif] = useState(null);
  const detailRef = useRef(null);

  const [url, setUrl] = useState(
    `${import.meta.env.VITE_BACKEND_SERVER}/notification/getallnotifications`
  );
  const { data, loading, error } = useFetch(url, { method: "GET", credentials: "include" });

  useEffect(() => {
    if (showDetail) {
      const focusable = detailRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
      const onKeyDown = (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setShowDetail(false);
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
    }
  }, [showDetail]);

  const handleClearAll = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/notification/deleteallnotifications`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setUrl(`${url}?retry=${Date.now()}`);
      }
    } catch (e) {
      console.error("Failed to clear notifications", e);
    }
  };

  const sortedData = Array.isArray(data) ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <div className="absolute w-full left-0 top-1">
        <Header />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Stay updated with the latest activities and alerts.
            </p>
          </div>
          {!loading && !error && sortedData.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading notifications...</p>
          </div>
        )}

        {error && (
          <div className="py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 text-center px-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Failed to load notifications</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button
              className="rounded-xl px-6 py-2.5 bg-amber-400 text-black font-semibold hover:bg-amber-500 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
              onClick={() => setUrl(`${url}?retry=${Date.now()}`)}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && sortedData.length === 0 && (
          <div className="py-20 bg-white dark:bg-gray-800/50 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Bell className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're all caught up</h3>
            <p className="text-gray-500 dark:text-gray-400">There are no new notifications to show here right now.</p>
          </div>
        )}

        {!loading && !error && sortedData.length > 0 && (
          <div className="space-y-4">
            {sortedData.map((n) => (
              <div
                key={n._id}
                onClick={() => {
                  setActiveNotif(n);
                  setShowDetail(true);
                }}
                className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700/50 transition-all duration-200 cursor-pointer overflow-hidden ${
                  !n.read ? "ring-1 ring-amber-400/50 bg-amber-50/10 dark:bg-amber-900/5" : ""
                }`}
              >
                {!n.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                )}
                
                <div className="flex gap-4 sm:gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                      !n.read ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" : "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                    }`}>
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h3 className={`text-base sm:text-lg truncate pr-4 ${!n.read ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-800 dark:text-gray-200"}`}>
                        {n.header}
                      </h3>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                      {n.content}
                    </p>
                    
                    <div className="flex items-center text-xs font-medium text-amber-600 dark:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0 duration-200">
                      View details <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Overlay for Details */}
        {showDetail && activeNotif && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Notification details"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowDetail(false);
            }}
          >
            <div
              ref={detailRef}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 shadow-2xl outline-none transform animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex-shrink-0 px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !activeNotif.read ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}>
                      <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                      {activeNotif.header}
                    </h4>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatTime(activeNotif.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  className="rounded-full p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                  onClick={() => setShowDetail(false)}
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 mb-6 border border-gray-100 dark:border-gray-700/50">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-amber-500" />
                    Message
                  </h5>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                    {activeNotif.content}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                       Status
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {activeNotif.read ? (
                         <><CheckCircle2 className="w-4 h-4 text-green-500" /> Read</>
                      ) : (
                         <><span className="w-2 h-2 rounded-full bg-amber-500 ml-1"></span> Unread</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-end">
                <button
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-sm"
                  onClick={() => setShowDetail(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
