import { useState, useEffect, useMemo } from "react";
import {
  X,
  Pencil,
  Clock,
  Calendar,
  MapPin,
  Building2,
  Tag,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Loader2,
  Briefcase
} from "lucide-react";
import useFetch from "../../hooks/useFetch";

export function EventDetailModal({ event, isOpen, onClose, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [canedit, setCanedit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { data: access } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/caneditevents`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  useEffect(() => {
    if (access && typeof access.hasaccess === "boolean") {
      setCanedit(access.hasaccess);
    }
  }, [access]);

  useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
      setIsEditing(false);
      setSaveError(null);
    }
  }, [event, isOpen]);

  const effectiveStatus = useMemo(() => {
    if (!event) return "upcoming";
    const status = event.event_status || "upcoming";
    if (status === "completed" || status === "cancelled") return status;
    try {
      if (!event.event_date) return status;
      const d = new Date(event.event_date);
      let hours = 9;
      let minutes = 0;
      if (event.event_time) {
        const match = String(event.event_time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          if (match[3]?.toUpperCase() === "PM" && hours < 12) hours += 12;
          if (match[3]?.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
      }
      const istOffsetMs = 5.5 * 60 * 60 * 1000;
      const startUtcMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hours, minutes) - istOffsetMs;
      const endUtcMs = startUtcMs + 4 * 60 * 60 * 1000; // default 4 hours
      const nowMs = Date.now();

      if (nowMs >= endUtcMs) return "completed";
      if (nowMs >= startUtcMs) return "ongoing";
      return status;
    } catch {
      return status;
    }
  }, [event]);

  const isCompletedOrCancelled = effectiveStatus === "completed" || effectiveStatus === "cancelled";

  if (!isOpen || !event) return null;

  const handleInputChange = (field, value) => {
    setEditedEvent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/event/updateevent`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editedEvent),
        }
      );

      const result = await res.json();
      if (!res.ok || result.message !== "success") {
        throw new Error(result.message || "Failed to update event");
      }

      setIsEditing(false);
      if (typeof onUpdated === "function") {
        onUpdated(editedEvent);
      }
    } catch (error) {
      setSaveError(error.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toISOString().split("T")[0];
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live Now
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <CheckCircle2 size={13} className="text-gray-500" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertCircle size={13} className="text-red-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Sparkles size={13} className="text-amber-500" />
            Upcoming
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Event" : "Event Details"}
            </h3>
            {getStatusBadge(effectiveStatus)}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {saveError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-5">
              {/* Event Title & Organizer */}
              <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-words">
                  {event.event_title}
                </h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {event.organizer_company && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-200/70 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300">
                      <Briefcase size={13} />
                      <span>{event.organizer_company}</span>
                    </div>
                  )}
                  {event.chapter?.chapter_name && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      <Building2 size={13} />
                      <span>{event.chapter.chapter_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20 flex items-start gap-3">
                  <Calendar size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Date</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {formatDate(event.event_date)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20 flex items-start gap-3">
                  <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Time</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {event.event_time || "09:00 AM"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20 flex items-start gap-3">
                  <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Location</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block break-words">
                      {event.location || "Not specified"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/20 flex items-start gap-3">
                  <Tag size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Event Type</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 capitalize block">
                      {event.event_type || "Weekly"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.event_description && (
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/30">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <FileText size={15} className="text-amber-500" />
                    <span>Event Description</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {event.event_description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* EDIT MODE */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={editedEvent.event_title || ""}
                  onChange={(e) => handleInputChange("event_title", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Organizer Company *
                </label>
                <input
                  type="text"
                  value={editedEvent.organizer_company || ""}
                  onChange={(e) => handleInputChange("organizer_company", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Organizer company name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formatDateForInput(editedEvent.event_date)}
                    onChange={(e) => handleInputChange("event_date", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Event Time *
                  </label>
                  <input
                    type="text"
                    value={editedEvent.event_time || ""}
                    onChange={(e) => handleInputChange("event_time", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="e.g. 09:00 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={editedEvent.location || ""}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Event venue or location"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Event Type
                  </label>
                  <select
                    value={editedEvent.event_type || "weekly"}
                    onChange={(e) => handleInputChange("event_type", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Event Description
                </label>
                <textarea
                  rows={3}
                  value={editedEvent.event_description || ""}
                  onChange={(e) => handleInputChange("event_description", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Enter details about this event..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-end gap-2.5 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedEvent({ ...event });
                }}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              {/* EDIT BUTTON: strictly removed for completed or cancelled events */}
              {!isCompletedOrCancelled && canedit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs sm:text-sm font-bold shadow-sm transition-all"
                >
                  <Pencil size={15} />
                  <span>Edit Event</span>
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// Backwards-compatible alias
export const EventsModal = EventDetailModal;
export default EventDetailModal;
