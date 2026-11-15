import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Bell,
  Check,
  X,
  IndianRupee,
  ArrowRight,
  ExternalLink,
  CheckCheck
} from "lucide-react";
import useFetch from "../hooks/useFetch";
import { NavLink, useNavigate } from "react-router-dom";
import {
  formatNotificationTime,
  formatFullDateTime,
  getNotificationCategory,
  getCategoryConfig,
  isReferralNotification,
  extractReferrerInfo
} from "./notificationUtils";

export default function Notification() {
  const navigate = useNavigate();
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
    if (Array.isArray(listData)) setNotifications(listData);
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
      console.error("Failed to mark all as read:", e);
      setNotifications(prev);
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

    if (!n.read) {
      setNotifications((prevList) =>
        prevList.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
      try {
        await patchReadById(n._id);
      } catch (e) {
        console.error("Failed to mark read:", e);
      }
    }
  };

  const handlePunchTYB = async (n, e) => {
    if (e) e.stopPropagation();

    // Mark as read
    if (!n.read) {
      setNotifications((prevList) =>
        prevList.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
      try {
        await patchReadById(n._id);
      } catch (err) {
        console.error(err);
      }
    }

    setOpen(false);
    setDetailOpen(false);

    const refInfo = extractReferrerInfo(n);
    const prefillComments = refInfo.referralDetails
      ? `Regarding referral: ${refInfo.referralDetails}`
      : (refInfo.referrerName ? `Business from referral by ${refInfo.referrerName}` : "");

    navigate('/slips', {
      state: {
        action: 'OPEN_TYB',
        referrerName: refInfo.referrerName,
        prefillComments: prefillComments,
        crossChapter: refInfo.crossChapter,
        chapterId: refInfo.chapterId
      }
    });
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
        className="relative inline-flex items-center justify-center rounded-xl p-2.5 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
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
          className="absolute right-0 sm:-right-4 z-50 mt-2 w-88 sm:w-96 origin-top-right rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4 bg-gray-50/70 dark:bg-gray-900/90 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {unreadCount} new
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
                  disabled={listLoading || !!listError}
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={close}
                aria-label="Close notifications"
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60 custom-scrollbar">
            {listLoading && (
              <li className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-2" />
                <p>Loading notifications…</p>
              </li>
            )}
            {listError && (
              <li className="px-5 py-8 text-center text-sm text-red-600 dark:text-red-400">
                Failed to load notifications. Please try again.
              </li>
            )}
            {!listLoading && !listError && notifications.length === 0 && (
              <li className="px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">No notifications yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We'll alert you here when new activities arrive.</p>
              </li>
            )}

            {!listLoading && !listError && notifications.map((n) => {
              const cat = getNotificationCategory(n);
              const conf = getCategoryConfig(cat);
              const isRef = isReferralNotification(n);
              const CategoryIcon = conf.Icon;

              return (
                <li key={n._id}>
                  <div
                    onClick={() => openDetails(n)}
                    className={`group relative flex flex-col p-4 text-left transition-all cursor-pointer hover:bg-amber-50/40 dark:hover:bg-gray-800/60 ${
                      !n.read
                        ? "bg-amber-500/5 dark:bg-amber-500/5"
                        : "bg-white dark:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Category Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-xl ${conf.iconBgClass} shadow-sm`}>
                        <CategoryIcon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-bold truncate ${!n.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                            {n.header}
                          </p>
                          {!n.read && (
                            <span
                              className="h-2 w-2 flex-none rounded-full bg-red-500 ring-4 ring-red-500/20"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {n.content}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            {formatNotificationTime(n.createdAt)}
                          </span>

                          {/* "Punch TYB" button for Referral Notifications */}
                          {isRef && (
                            <button
                              type="button"
                              onClick={(e) => handlePunchTYB(n, e)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-500/30 shadow-sm transition-transform active:scale-95"
                              title="Open TYB Slip with details autofilled"
                            >
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>Punch TYB</span>
                              <ArrowRight className="w-3 h-3 ml-0.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50/70 dark:bg-gray-900/90 flex justify-between items-center">
            <NavLink
              to='/allnotifications'
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              onClick={() => setOpen(false)}
            >
              <span>View all notifications</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </NavLink>
            <span className="text-[11px] text-gray-400">
              {notifications.length} total
            </span>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailOpen && activeNotif && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Notification details"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetailOpen(false);
          }}
        >
          <div
            ref={detailRef}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800 outline-none animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryConfig(getNotificationCategory(activeNotif)).badgeClass}`}>
                  {getCategoryConfig(getNotificationCategory(activeNotif)).label}
                </span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  {activeNotif.header}
                </h4>
              </div>
              <button
                className="rounded-xl p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setDetailOpen(false)}
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="my-5 space-y-4">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-4 border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {activeNotif.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Received:</span>{" "}
                  {formatFullDateTime(activeNotif.createdAt)}
                </div>
                {activeNotif.sender && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">From:</span>{" "}
                    {typeof activeNotif.sender === 'object' ? activeNotif.sender.name || activeNotif.sender.username : activeNotif.sender}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="w-full sm:w-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setDetailOpen(false)}
              >
                Close
              </button>

              {/* Punch TYB CTA inside detail modal */}
              {isReferralNotification(activeNotif) && (
                <button
                  type="button"
                  onClick={() => handlePunchTYB(activeNotif)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-gray-900 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <IndianRupee className="w-4 h-4" />
                  <span>Punch TYB for this Referral</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
