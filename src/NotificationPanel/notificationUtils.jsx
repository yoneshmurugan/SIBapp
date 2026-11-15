import React from "react";
import {
  Bell,
  Share2,
  IndianRupee,
  Users,
  Calendar,
  Sparkles,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";

export function formatNotificationTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return "Just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
    });
  } catch {
    return "";
  }
}

export function formatFullDateTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

export function getNotificationCategory(n) {
  if (!n) return "general";
  const header = (n.header || "").toLowerCase();
  const content = (n.content || "").toLowerCase();
  const action = n.data?.action;

  // 1. M2M (Member-to-Member) Meeting Slips
  // Checked first because it contains "meeting" and must not fall into general chapter "meeting"
  if (
    action === "OPEN_M2M" ||
    header.includes("m2m") ||
    header.includes("1-to-1") ||
    header.includes("one-to-one") ||
    content.includes("member-to-member (m2m)") ||
    content.includes("m2m meeting") ||
    content.includes("1-to-1 meeting")
  ) {
    return "m2m";
  }

  // 2. TYB (Thank You for the Business) Slips
  // Checked before referral because TYB messages mention "for your referral"!
  if (
    action === "VIEW_ACTIVITY" ||
    header.includes("tyb") ||
    header.includes("thank you for the business") ||
    header.includes("thank you") ||
    content.includes("logged a tyb slip") ||
    content.includes("tyb slip") ||
    content.includes("thank you for the business")
  ) {
    return "tyb";
  }

  // 3. Referral Slips (Only actual referrals received)
  if (
    action === "OPEN_TYB" ||
    header.includes("new referral") ||
    header.includes("referral received") ||
    header.includes("referral from") ||
    (header.includes("referral") && !header.includes("tyb") && !content.includes("logged a tyb"))
  ) {
    return "referral";
  }

  // 4. Chapter Meetings
  if (header.includes("chapter meeting") || header.includes("meeting")) {
    return "meeting";
  }

  // 5. Events
  if (header.includes("event")) {
    return "event";
  }

  // 6. Broadcast / Alert / Announcement
  if (
    header.includes("announcement") ||
    header.includes("urgent") ||
    header.includes("broadcast") ||
    header.includes("alert") ||
    header.includes("renewal") ||
    content.includes("announcement") ||
    content.includes("urgent")
  ) {
    return "announcement";
  }

  return "general";
}

export function isReferralNotification(n) {
  if (!n) return false;
  const header = (n.header || "").toLowerCase();
  const content = (n.content || "").toLowerCase();
  const action = n.data?.action;

  // Explicitly exclude TYB, M2M, Meetings, Events, Alerts
  if (
    action === "VIEW_ACTIVITY" ||
    action === "OPEN_M2M" ||
    header.includes("tyb") ||
    header.includes("thank you") ||
    content.includes("logged a tyb") ||
    content.includes("tyb slip") ||
    header.includes("m2m") ||
    header.includes("meeting") ||
    header.includes("event") ||
    header.includes("announcement") ||
    header.includes("urgent") ||
    header.includes("renewal")
  ) {
    return false;
  }

  return (
    action === "OPEN_TYB" ||
    header.includes("new referral") ||
    header.includes("referral received") ||
    header.includes("referral from") ||
    (header.includes("referral") && !header.includes("tyb"))
  );
}

export function getCategoryConfig(category) {
  switch (category) {
    case "referral":
      return {
        label: "Referral",
        Icon: Share2,
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        iconBgClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
        accentBorder: "border-l-amber-500",
      };
    case "tyb":
      return {
        label: "TYB",
        Icon: IndianRupee,
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        iconBgClass: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        accentBorder: "border-l-emerald-500",
      };
    case "m2m":
      return {
        label: "M2M",
        Icon: Users,
        badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
        iconBgClass: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
        accentBorder: "border-l-indigo-500",
      };
    case "meeting":
      return {
        label: "Meeting",
        Icon: Calendar,
        badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
        iconBgClass: "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
        accentBorder: "border-l-sky-500",
      };
    case "event":
      return {
        label: "Event",
        Icon: Sparkles,
        badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
        iconBgClass: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
        accentBorder: "border-l-violet-500",
      };
    case "announcement":
      return {
        label: "Announcement",
        Icon: Megaphone,
        badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        iconBgClass: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
        accentBorder: "border-l-rose-500",
      };
    default:
      return {
        label: "Update",
        Icon: Bell,
        badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
        iconBgClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
        accentBorder: "border-l-slate-400",
      };
  }
}

export function extractReferrerInfo(n) {
  if (!n) {
    return {
      referrerName: "",
      referralDetails: "",
      crossChapter: false,
      chapterId: null
    };
  }

  // 1. Direct from data payload
  if (n.data?.referrerName) {
    return {
      referrerName: n.data.referrerName,
      referralDetails: n.data.referralDetails || "",
      crossChapter: !!n.data.crossChapter,
      chapterId: n.data.chapterId || null
    };
  }

  // 2. From sender if populated or string
  let senderUsername = "";
  if (n.sender && typeof n.sender === "object" && n.sender.username) {
    senderUsername = n.sender.username;
  } else if (typeof n.sender === "string" && !n.sender.match(/^[0-9a-fA-F]{24}$/)) {
    senderUsername = n.sender;
  }

  // 3. Fallback: Parse from header or content
  if (!senderUsername) {
    const headerMatch = (n.header || "").match(/from\s+([a-zA-Z0-9_.-]+)/i);
    const contentMatch = (n.content || "").match(/from\s+([a-zA-Z0-9_.-]+)/i);
    if (headerMatch && headerMatch[1]) {
      senderUsername = headerMatch[1].trim();
    } else if (contentMatch && contentMatch[1]) {
      senderUsername = contentMatch[1].trim();
    }
  }

  // Extract referral details
  let referralDetails = n.data?.referralDetails || "";
  if (!referralDetails && n.content) {
    const colonIdx = n.content.lastIndexOf(":");
    if (colonIdx !== -1 && colonIdx < n.content.length - 2) {
      referralDetails = n.content.slice(colonIdx + 1).trim();
    }
  }

  return {
    referrerName: senderUsername,
    referralDetails: referralDetails,
    crossChapter: !!n.data?.crossChapter,
    chapterId: n.data?.chapterId || null
  };
}
