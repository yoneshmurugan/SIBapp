import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import Header from "../MainPage/Header";
import {
  Bell,
  Search,
  CheckCheck,
  Trash2,
  RefreshCw,
  X,
  IndianRupee,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  Share2,
  Users,
  Megaphone,
  Sparkles
} from "lucide-react";
import {
  formatNotificationTime,
  formatFullDateTime,
  getNotificationCategory,
  getCategoryConfig,
  isReferralNotification,
  extractReferrerInfo,
  cleanNotificationTitle
} from "./notificationUtils";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDetail, setShowDetail] = useState(false);
  const [activeNotif, setActiveNotif] = useState(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all' | 'unread' | 'referral' | 'tyb' | 'm2m' | 'meeting' | 'announcement'
  const detailRef = useRef(null);

  const [url, setUrl] = useState(
    `${import.meta.env.VITE_BACKEND_SERVER}/notification/getallnotifications`
  );
  const { data, loading, error } = useFetch(url, { method: "GET", credentials: "include" });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setNotifications(data);
    }
  }, [data]);

  // If navigated from popover with openId, auto-open details modal
  useEffect(() => {
    if (location.state?.openId && notifications.length > 0) {
      const target = notifications.find((n) => n._id === location.state.openId);
      if (target) {
        openModal(target);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, notifications, navigate, location.pathname]);

  // Compute counts
  const counts = useMemo(() => {
    const list = notifications || [];
    return {
      all: list.length,
      unread: list.filter((n) => !n.read).length,
      referral: list.filter((n) => getNotificationCategory(n) === "referral").length,
      tyb: list.filter((n) => getNotificationCategory(n) === "tyb").length,
      m2m: list.filter((n) => getNotificationCategory(n) === "m2m").length,
      meeting: list.filter((n) => {
        const cat = getNotificationCategory(n);
        return cat === "meeting" || cat === "event";
      }).length,
      announcement: list.filter((n) => getNotificationCategory(n) === "announcement").length,
    };
  }, [notifications]);

  // Filtered and searched notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category filter
      const cat = getNotificationCategory(n);
      if (selectedFilter === "unread" && n.read) return false;
      if (selectedFilter === "referral" && cat !== "referral") return false;
      if (selectedFilter === "tyb" && cat !== "tyb") return false;
      if (selectedFilter === "m2m" && cat !== "m2m") return false;
      if (selectedFilter === "meeting" && cat !== "meeting" && cat !== "event") return false;
      if (selectedFilter === "announcement" && cat !== "announcement") return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const headerMatch = (n.header || "").toLowerCase().includes(query);
        const contentMatch = (n.content || "").toLowerCase().includes(query);
        const senderMatch =
          typeof n.sender === "object"
            ? (n.sender?.name || n.sender?.username || "").toLowerCase().includes(query)
            : String(n.sender || "").toLowerCase().includes(query);
        if (!headerMatch && !contentMatch && !senderMatch) return false;
      }

      return true;
    });
  }, [notifications, selectedFilter, searchQuery]);

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

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingRead(true);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/readallnotifications`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        }
      );
      if (res.ok) {
        setUrl(url.split("?")[0] + "?t=" + Date.now());
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      setIsClearing(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/deleteallnotifications`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setNotifications([]);
        setUrl(url.split("?")[0] + "?t=" + Date.now());
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const openModal = async (n) => {
    setActiveNotif(n);
    setShowDetail(true);

    if (!n.read) {
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
      try {
        await patchReadById(n._id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePunchTYB = async (n, e) => {
    if (e) e.stopPropagation();

    if (!n.read) {
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
      try {
        await patchReadById(n._id);
      } catch (err) {
        console.error(err);
      }
    }

    setShowDetail(false);
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
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [showDetail]);

  const filterTabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "unread", label: "Unread", count: counts.unread },
    { id: "referral", label: "Referrals", count: counts.referral },
    { id: "tyb", label: "TYB", count: counts.tyb },
    { id: "m2m", label: "M2M", count: counts.m2m },
    { id: "meeting", label: "Meetings", count: counts.meeting },
    { id: "announcement", label: "Announcements", count: counts.announcement },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black/30 pb-16">
      <div className="sticky top-0 z-40">
        <Header />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Page Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Notifications
              </h1>
              {counts.unread > 0 && (
                <span className="rounded-full bg-red-500/10 dark:bg-red-500/20 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                  {counts.unread} unread
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Stay updated on referrals, TYB acknowledgments, chapter assemblies, and alerts.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {counts.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingRead}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-bold border border-amber-500/20 transition-all disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{isMarkingRead ? "Marking..." : "Mark all read"}</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}

            <button
              onClick={() => setUrl(url.split("?")[0] + "?t=" + Date.now())}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4 mb-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications by title, member, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-3 pl-10 pr-10 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {filterTabs.map((tab) => {
              const active = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    active
                      ? "bg-amber-400 text-gray-950 shadow-md shadow-amber-400/20"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-600"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                      active
                        ? "bg-black/15 text-gray-950"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-amber-500 border-t-transparent mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading your notifications…</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-6 text-center my-6">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
              Failed to load notifications: {error}
            </p>
            <button
              onClick={() => setUrl(url.split("?")[0] + "?t=" + Date.now())}
              className="rounded-xl px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center my-6 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {searchQuery ? "No matching notifications" : "No notifications in this view"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or clearing the filter."
                : "You're all caught up! New notifications will appear here as business occurs."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 rounded-xl px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Notifications Feed */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="space-y-3">
            {filteredNotifications.map((n) => {
              const cat = getNotificationCategory(n);
              const conf = getCategoryConfig(cat);
              const isRef = isReferralNotification(n);

              return (
                <div
                  key={n._id}
                  onClick={() => openModal(n)}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-y border-r border-l-4 ${conf.borderClass} transition-all cursor-pointer hover:shadow-md ${
                    !n.read
                      ? "bg-amber-500/[0.04] dark:bg-amber-500/[0.06] border-gray-200/80 dark:border-gray-800 ring-1 ring-amber-400/10"
                      : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  {/* Left Content Area */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${conf.badgeClass}`}>
                        {conf.label}
                      </span>

                      {!n.read && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-red-500/30" />
                          New
                        </span>
                      )}

                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto whitespace-nowrap">
                        {formatNotificationTime(n.createdAt)}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold leading-snug break-words ${!n.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                      {cleanNotificationTitle(n.header)}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {n.content}
                    </p>
                  </div>

                  {/* Right Actions Area */}
                  <div className="flex items-center justify-end sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                    {isRef && (
                      <button
                        type="button"
                        onClick={(e) => handlePunchTYB(n, e)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                        title="Punch TYB for this referral"
                      >
                        <IndianRupee className="w-4 h-4" />
                        <span>Punch TYB</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Dialog */}
      {showDetail && activeNotif && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Notification details"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowDetail(false);
          }}
        >
          <div
            ref={detailRef}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-800 outline-none animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryConfig(getNotificationCategory(activeNotif)).badgeClass}`}>
                  {getCategoryConfig(getNotificationCategory(activeNotif)).label}
                </span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  {cleanNotificationTitle(activeNotif.header)}
                </h4>
              </div>
              <button
                className="rounded-xl p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowDetail(false)}
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
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Sender:</span>{" "}
                    {typeof activeNotif.sender === "object"
                      ? activeNotif.sender.name || activeNotif.sender.username
                      : activeNotif.sender}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>{" "}
                  {activeNotif.read ? "Read" : "Unread"}
                </div>
                {activeNotif.readAt && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Read At:</span>{" "}
                    {formatFullDateTime(activeNotif.readAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="w-full sm:w-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowDetail(false)}
              >
                Close
              </button>

              {isReferralNotification(activeNotif) && (
                <button
                  type="button"
                  onClick={() => handlePunchTYB(activeNotif)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-md shadow-amber-500/20 transition-all active:scale-95"
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
