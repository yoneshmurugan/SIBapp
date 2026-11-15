import { useState } from "react";
import {
  Megaphone,
  AlertTriangle,
  Calendar,
  Bell,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Send,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";

export default function AlertSystem({ onAlertSent }) {
  const [formData, setFormData] = useState({
    type: "Announcement", // "Announcement" | "Urgent" | "Event Info"
    title: "",
    message: "",
    notificationMethods: {
      inapp: true,
      push: true,
      email: false,
    }
  });

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState("inapp"); // "inapp" | "push" | "email"
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const alertTypes = [
    {
      id: "Announcement",
      label: "Announcement",
      subtitle: "General chapter news & updates",
      badge: "Standard",
      icon: Megaphone,
      activeBorder: "border-blue-400 dark:border-blue-500",
      activeBg: "bg-blue-50/70 dark:bg-blue-950/40",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
    },
    {
      id: "Urgent",
      label: "Urgent Alert",
      subtitle: "Critical & time-sensitive notice",
      badge: "High Priority",
      icon: AlertTriangle,
      activeBorder: "border-red-400 dark:border-red-500",
      activeBg: "bg-red-50/70 dark:bg-red-950/40",
      iconBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
    },
    {
      id: "Event Info",
      label: "Event Info",
      subtitle: "Assemblies, summits & schedules",
      badge: "Scheduled",
      icon: Calendar,
      activeBorder: "border-emerald-400 dark:border-emerald-500",
      activeBg: "bg-emerald-50/70 dark:bg-emerald-950/40",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
    }
  ];

  const handleTypeChange = (type) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMethod = (method) => {
    setFormData(prev => ({
      ...prev,
      notificationMethods: {
        ...prev.notificationMethods,
        [method]: !prev.notificationMethods[method]
      }
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Alert title is required.");
      return false;
    }
    if (!formData.message.trim()) {
      setError("Alert message content is required.");
      return false;
    }
    if (
      !formData.notificationMethods.inapp &&
      !formData.notificationMethods.push &&
      !formData.notificationMethods.email
    ) {
      setError("Please select at least one delivery channel (In-App, Push, or Email).");
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
          email: formData.notificationMethods.email
        }
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createbulknotifications`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to broadcast alert.");
      }

      const channelList = [];
      if (formData.notificationMethods.inapp) channelList.push("In-App");
      if (formData.notificationMethods.push) channelList.push("Push Notification");
      if (formData.notificationMethods.email) channelList.push("Email");

      setSuccess(
        data.message || `Alert broadcasted successfully via ${channelList.join(", ")}!`
      );
      setTimeout(() => setSuccess(null), 4000);

      setFormData({
        type: "Announcement",
        title: "",
        message: "",
        notificationMethods: {
          inapp: true,
          push: true,
          email: false
        }
      });
      setShowPreview(false);

      if (typeof onAlertSent === "function") {
        onAlertSent();
      }
    } catch (err) {
      setError(err.message || "Failed to broadcast alert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeTypeObj = alertTypes.find(t => t.id === formData.type) || alertTypes[0];

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1.5">
              <Sparkles size={11} />
              <span>Chapter Broadcast</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Alert Broadcast System
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Broadcast critical chapter notices, urgent alerts, and event updates across all member channels.
            </p>
          </div>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* 1. Alert Type Selector */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
            1. Select Alert Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {alertTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.type === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? `${type.activeBorder} ${type.activeBg} shadow-sm ring-1 ring-amber-400/40`
                      : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`p-2 rounded-lg border ${type.iconBg}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${type.badgeColor}`}>
                      {type.badge}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100 block">
                      {type.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 block">
                      {type.subtitle}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Alert Content Form */}
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="alert-title" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                2. Alert Title
              </label>
              <span className={`text-[11px] ${formData.title.length > 85 ? "text-amber-500 font-bold" : "text-gray-400"}`}>
                {formData.title.length}/100
              </span>
            </div>
            <input
              id="alert-title"
              type="text"
              maxLength={100}
              value={formData.title}
              placeholder="e.g. Special Chapter Assembly & Networking Session"
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="alert-message" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                3. Alert Message Content
              </label>
              <span className={`text-[11px] ${formData.message.length > 900 ? "text-amber-500 font-bold" : "text-gray-400"}`}>
                {formData.message.length}/1000
              </span>
            </div>
            <textarea
              id="alert-message"
              rows={4}
              maxLength={1000}
              value={formData.message}
              placeholder="Type your alert message clearly. This will be transmitted directly across the selected channels to all active chapter members..."
              onChange={(e) => handleInputChange("message", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 transition-all resize-none custom-scrollbar"
            />
          </div>
        </div>

        {/* 3. Delivery Channels / Notification Methods */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
            4. Delivery Channels
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* In-App */}
            <div
              onClick={() => toggleMethod("inapp")}
              className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 flex flex-col justify-between ${
                formData.notificationMethods.inapp
                  ? "border-amber-400/80 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/30"
                  : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 hover:border-gray-300 dark:hover:border-gray-700 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-amber-500">
                  <Bell size={18} />
                </div>
                <input
                  type="checkbox"
                  checked={formData.notificationMethods.inapp}
                  onChange={() => {}} // handled by card click
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-500 focus:ring-amber-400 cursor-pointer pointer-events-none"
                />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 block">
                  In-App Notification
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 block mt-0.5">
                  Notification bell & feed
                </span>
              </div>
            </div>

            {/* Mobile Push */}
            <div
              onClick={() => toggleMethod("push")}
              className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 flex flex-col justify-between ${
                formData.notificationMethods.push
                  ? "border-amber-400/80 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/30"
                  : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 hover:border-gray-300 dark:hover:border-gray-700 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-amber-500">
                  <Smartphone size={18} />
                </div>
                <input
                  type="checkbox"
                  checked={formData.notificationMethods.push}
                  onChange={() => {}} // handled by card click
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-500 focus:ring-amber-400 cursor-pointer pointer-events-none"
                />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 block">
                  Push Notification
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 block mt-0.5">
                  Mobile devices (iOS & Android)
                </span>
              </div>
            </div>

            {/* Email Broadcast */}
            <div
              onClick={() => toggleMethod("email")}
              className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 flex flex-col justify-between ${
                formData.notificationMethods.email
                  ? "border-amber-400/80 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/30"
                  : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 hover:border-gray-300 dark:hover:border-gray-700 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-amber-500">
                  <Mail size={18} />
                </div>
                <input
                  type="checkbox"
                  checked={formData.notificationMethods.email}
                  onChange={() => {}} // handled by card click
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-500 focus:ring-amber-400 cursor-pointer pointer-events-none"
                />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 block">
                  Notify via Email
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 block mt-0.5">
                  Chapter members' inboxes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Live Multi-Channel Interactive Preview */}
        {showPreview && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-750 transition-all duration-300 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-200 dark:border-gray-700/60 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Eye size={14} className="text-amber-500" />
                Live Channel Preview
              </span>

              {/* Channel Selector for Preview */}
              <div className="flex items-center gap-1 bg-gray-200/80 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewTab("inapp")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === "inapp"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  In-App Feed
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("push")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === "push"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  Mobile Push
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("email")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === "email"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  Email Message
                </button>
              </div>
            </div>

            {/* In-App Preview */}
            {previewTab === "inapp" && (
              <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${activeTypeObj.iconBg}`}>
                  <activeTypeObj.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100 break-words">
                      {formData.title ? `${formData.type}: ${formData.title}` : `${formData.type}: (Alert Title)`}
                    </span>
                    <span className="text-[11px] text-gray-400 shrink-0">Just now</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">
                    {formData.message || "(Your message text will be displayed here for chapter members to read...)"}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${activeTypeObj.badgeColor}`}>
                      {formData.type}
                    </span>
                    <span className="text-[11px] text-gray-400">Chapter Broadcast</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Push Preview */}
            {previewTab === "push" && (
              <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-gray-900 text-white shadow-xl border border-gray-700 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center shrink-0 font-black text-xs">
                  SIB
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-0.5">
                    <span className="font-semibold text-gray-300">SENGUNTHAR IN BUSINESS</span>
                    <span className="text-[10px]">now</span>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-white block truncate">
                    {formData.title ? `${formData.type}: ${formData.title}` : `${formData.type}: Alert Title`}
                  </span>
                  <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">
                    {formData.message || "Alert message preview snippet on lock screen..."}
                  </p>
                </div>
              </div>
            )}

            {/* Email Preview */}
            {previewTab === "email" && (
              <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-left space-y-3">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-2 text-xs text-gray-500 space-y-1">
                  <div><strong className="text-gray-700 dark:text-gray-300">Subject:</strong> {formData.title ? `${formData.type}: ${formData.title}` : `Alert Title`}</div>
                  <div><strong className="text-gray-700 dark:text-gray-300">From:</strong> SIB Chapter Leadership &lt;notifications@sib.in&gt;</div>
                </div>
                <div className="pt-1">
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    {formData.title || "Announcement Title"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                    {formData.message || "Official announcement content transmitted directly to chapter member registered email addresses."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showPreview ? "Hide Preview" : "Preview Alert"}</span>
          </button>

          <button
            type="button"
            onClick={handleSendNow}
            disabled={loading}
            className="flex-1 sm:flex-initial sm:min-w-[200px] px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-[0.99] text-gray-950 text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>{loading ? "Broadcasting Alert..." : "Send Alert Broadcast"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
