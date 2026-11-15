import { useState } from "react";
import { Send, Eye, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AlertSystem({ onAlertSent }) {
  const [formData, setFormData] = useState({
    type: "Announcement", // "Announcement" | "Urgent" | "Event Info"
    title: "",
    message: "",
    notificationMethods: {
      inapp: true,
      push: true,
      email: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const alertTypes = ["Announcement", "Urgent", "Event Info"];

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMethod = (method) => {
    setFormData((prev) => ({
      ...prev,
      notificationMethods: {
        ...prev.notificationMethods,
        [method]: !prev.notificationMethods[method],
      },
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Please enter an alert title.");
      return false;
    }
    if (!formData.message.trim()) {
      setError("Please enter the message content.");
      return false;
    }
    if (
      !formData.notificationMethods.inapp &&
      !formData.notificationMethods.push &&
      !formData.notificationMethods.email
    ) {
      setError("Please select at least one notification method (In-App, Push, or Email).");
      return false;
    }
    return true;
  };

  const handleSendNow = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        header: `${formData.type}: ${formData.title.trim()}`,
        content: formData.message.trim(),
        type: formData.type,
        methods: {
          inapp: formData.notificationMethods.inapp,
          push: formData.notificationMethods.push,
          email: formData.notificationMethods.email,
        },
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createbulknotifications`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to broadcast alert.");
      }

      const channelList = [];
      if (formData.notificationMethods.inapp) channelList.push("In-App");
      if (formData.notificationMethods.push) channelList.push("Push");
      if (formData.notificationMethods.email) channelList.push("Email");

      setSuccess(
        data.message || `Broadcast sent successfully via ${channelList.join(", ")}!`
      );
      setTimeout(() => setSuccess(null), 4000);

      // Reset form
      setFormData({
        type: "Announcement",
        title: "",
        message: "",
        notificationMethods: {
          inapp: true,
          push: true,
          email: false,
        },
      });
      setShowPreview(false);

      if (typeof onAlertSent === "function") {
        onAlertSent();
      }
    } catch (err) {
      setError(err.message || "Failed to broadcast alert. Please try again.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 relative flex flex-col justify-between">
      <div>
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
            Chapter Broadcast
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Active Chapter
          </span>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Broadcast Type Pills */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Alert Type
          </label>
          <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl">
            {alertTypes.map((t) => {
              const active = formData.type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all text-center ${
                    active
                      ? "bg-amber-400 text-gray-950 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alert Title Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="broadcast-title"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Alert Title
            </label>
            <span className="text-[11px] text-gray-400">
              {formData.title.length}/100
            </span>
          </div>
          <input
            id="broadcast-title"
            type="text"
            maxLength={100}
            value={formData.title}
            placeholder="e.g. Special Chapter Assembly & Networking Session"
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          />
        </div>

        {/* Alert Message Textarea */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="broadcast-message"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Alert Message
            </label>
            <span className="text-[11px] text-gray-400">
              {formData.message.length}/1000
            </span>
          </div>
          <textarea
            id="broadcast-message"
            rows={4}
            maxLength={1000}
            value={formData.message}
            placeholder="Type your alert message. This will be transmitted directly to all chapter members..."
            onChange={(e) => handleInputChange("message", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none custom-scrollbar"
          />
        </div>

        {/* Notification Methods (Minimal Checkboxes matching Renewal Management) */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-3">
            Notification Methods
          </span>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.notificationMethods.inapp}
                onChange={() => toggleMethod("inapp")}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                In-App Notification
              </span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.notificationMethods.push}
                onChange={() => toggleMethod("push")}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                Push Notification
              </span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.notificationMethods.email}
                onChange={() => toggleMethod("email")}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                Notify via Email
              </span>
            </label>
          </div>
        </div>

        {/* Minimal Preview Card */}
        {showPreview && (
          <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-amber-300/40 dark:border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Preview ({formData.type})
              </span>
              <span className="text-[11px] text-gray-400">Recipient View</span>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formData.title.trim() || "(Untitled Alert)"}
            </div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {formData.message.trim() || "(No message body)"}
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-1.5"
        >
          <Eye size={14} />
          <span>{showPreview ? "Hide Preview" : "Preview Alert"}</span>
        </button>

        <button
          type="button"
          onClick={handleSendNow}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-950 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Broadcasting...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>Broadcast Alert</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
