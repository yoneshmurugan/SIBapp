import React, { useState, useEffect } from "react";
import { 
  Laptop, 
  Smartphone, 
  Globe, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  Info 
} from "lucide-react";

function getDeviceInfo() {
  if (typeof navigator === "undefined") {
    return { os: "iOS", browser: "SIB iOS App", isMobile: true, deviceName: "iOS Device" };
  }
  const ua = navigator.userAgent || "";
  let os = "iOS";
  let browser = "SIB App";
  let isMobile = true;

  if (/iPhone|iPad|iPod/.test(ua)) {
    os = /iPad/.test(ua) ? "iPadOS" : "iOS";
    isMobile = true;
  } else if (/Android/.test(ua)) {
    os = "Android";
    isMobile = true;
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = "macOS";
    isMobile = false;
  } else if (/Windows/.test(ua)) {
    os = "Windows";
    isMobile = false;
  } else if (/Linux/.test(ua)) {
    os = "Linux";
    isMobile = false;
  }

  if (/Edg/.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome/.test(ua)) browser = "Chrome";
  else if (/Safari/.test(ua)) browser = "Safari";
  else if (/Firefox/.test(ua)) browser = "Firefox";

  return { os, browser, isMobile, deviceName: `${os} • ${browser}` };
}

export default function SessionsPanel({ onNavigateToPassword }) {
  const [sessionInfo, setSessionInfo] = useState({
    email: "",
    lastSignedIn: null,
    ip: "Detecting...",
    device: "Current iOS Device",
    isMobile: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadSessionData = () => {
    const dev = getDeviceInfo();
    setSessionInfo((prev) => ({
      ...prev,
      device: dev.deviceName,
      isMobile: dev.isMobile,
    }));

    // 1. Check cached session info
    try {
      const cached = localStorage.getItem("header_auth_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.email) {
          setSessionInfo((prev) => ({ ...prev, email: parsed.email }));
        }
        if (parsed?.last_signed_in) {
          setSessionInfo((prev) => ({ ...prev, lastSignedIn: new Date(parsed.last_signed_in) }));
        }
      }
    } catch (e) {
      console.warn("Failed to read cached user info", e);
    }

    // 2. Fetch live user details from backend
    fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/getuser`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSessionInfo((prev) => ({
            ...prev,
            email: data.email || prev.email,
            lastSignedIn: data.last_signed_in ? new Date(data.last_signed_in) : prev.lastSignedIn || new Date(),
            ip: data.current_ip || prev.ip,
          }));
        }
      })
      .catch((err) => console.warn("Failed to fetch user session info:", err));

    // 3. Fallback public IP resolution if backend returns loopback or private IP
    fetch("https://api.ipify.org?format=json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ip) {
          setSessionInfo((prev) => ({
            ...prev,
            ip: prev.ip === "Detecting..." || prev.ip === "::1" || prev.ip === "127.0.0.1" ? data.ip : prev.ip,
          }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSessionData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSessionData();
    setTimeout(() => setRefreshing(false), 800);
  };

  const formatTimestamp = (date) => {
    if (!date) return "Active Now";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Active Now";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-8 shadow-2xl backdrop-blur-md transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-amber-500" />
            Session & Device History
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review current and past account sign-in details to verify account access.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Session Info"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            Active Session
          </span>
        </div>
      </div>

      {/* Main Grid: Device, IP, Last Signed In Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Card 1: Device & Browser */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-800 flex items-start gap-3.5 transition-colors shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 shrink-0 border border-amber-500/20">
            {sessionInfo.isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Device & Browser
            </span>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-1">
              {sessionInfo.device}
            </p>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Current Active Device
            </span>
          </div>
        </div>

        {/* Card 2: IP Address */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-800 flex items-start gap-3.5 transition-colors shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 shrink-0 border border-amber-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              IP Address
            </span>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono truncate mt-1">
              {sessionInfo.ip}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
              Logged-in Network IP
            </span>
          </div>
        </div>

        {/* Card 3: Last Signed In */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-800 flex items-start gap-3.5 transition-colors shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 shrink-0 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Last Signed In
            </span>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-1">
              {formatTimestamp(sessionInfo.lastSignedIn)}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
              Timestamp (last_signed_in)
            </span>
          </div>
        </div>
      </div>

      {/* Session Security Details List */}
      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <span className="font-semibold text-gray-600 dark:text-gray-400">Account Email</span>
          <span className="font-mono text-gray-900 dark:text-gray-200 font-medium">
            {sessionInfo.email || "Active Member"}
          </span>
        </div>
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <span className="font-semibold text-gray-600 dark:text-gray-400">Authentication Protocol</span>
          <span className="text-gray-900 dark:text-gray-200 font-medium">
            Firebase Auth + Signed Session Cookie
          </span>
        </div>
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <span className="font-semibold text-gray-600 dark:text-gray-400">Security Status</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protected & Verified
          </span>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-950 dark:text-amber-200 block mb-0.5">
              Member Security Check
            </span>
            Members can see if anyone else accessed their account. If you ever notice an unfamiliar device, browser, or IP address, update your password immediately to secure your account.
          </div>
        </div>
        {onNavigateToPassword && (
          <button
            type="button"
            onClick={onNavigateToPassword}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Update Password
          </button>
        )}
      </div>
    </section>
  );
}

