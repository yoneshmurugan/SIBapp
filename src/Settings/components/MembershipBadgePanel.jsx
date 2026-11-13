import React, { useState, useEffect } from "react";
import { 
  BadgeCheck, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  Crown, 
  Award, 
  UserCheck, 
  Sparkles, 
  Loader2, 
  Building2, 
  AlertCircle,
  Shield
} from "lucide-react";

export default function MembershipBadgePanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Try reading cached profile data immediately
    try {
      const cached = localStorage.getItem("header_user_profile");
      if (cached) {
        setProfile(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {
      console.warn("Failed to read cached profile", e);
    }

    // 2. Fetch fresh profile data from backend
    fetch(`${import.meta.env.VITE_BACKEND_SERVER}/profile/getprofile`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setProfile(data);
          try {
            localStorage.setItem("header_user_profile", JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch((err) => console.warn("Failed to fetch profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyId = (idno) => {
    if (!idno) return;
    navigator.clipboard.writeText(idno);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const idno = profile?.membership?.idno || profile?.idno || "SIB-MEMBER";
  const role = (profile?.membership?.role || profile?.role || "Member").trim();
  const chapterName = profile?.chaptername || "SIB Chapter";
  const chapterCode = profile?.chapter_code || "SIB";
  const joinDate = profile?.membership?.join_date || profile?.createdAt;
  const renewalDate = profile?.membership?.renewal_date || profile?.membership?.join_date;

  // Calculate Renewal Countdown
  const calculateDaysRemaining = () => {
    if (!renewalDate) return null;
    const renewal = new Date(renewalDate);
    if (isNaN(renewal.getTime())) return null;
    const now = new Date();
    const diffTime = renewal.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining();

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getRoleBadge = (r) => {
    const lower = r.toLowerCase();
    if (lower.includes("president")) {
      return {
        label: "President",
        icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
        className: "bg-amber-500/20 text-amber-300 border border-amber-500/40"
      };
    }
    if (lower.includes("coordinator")) {
      return {
        label: "Chapter Coordinator",
        icon: <Award className="w-3.5 h-3.5 text-cyan-400" />,
        className: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
      };
    }
    return {
      label: "Active Member",
      icon: <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />,
      className: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
    };
  };

  const roleMeta = getRoleBadge(role);

  return (
    <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md transition-all space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
            Membership Badge
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your verified Sengunthar In Business chapter credential and digital badge.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          Verified SIB Identity
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading membership badge...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Digital Membership Card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-6 sm:p-8 shadow-2xl shadow-black/40 text-white">
            {/* Background Glow & Pattern */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar of the Badge */}
            <div className="relative flex items-center justify-between pb-6 border-b border-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm tracking-wider">
                  SIB
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-100 tracking-wide">
                    Sengunthar In Business
                  </h3>
                  <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                    {chapterName} ({chapterCode})
                  </p>
                </div>
              </div>

              {/* Role Pill */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roleMeta.className}`}>
                {roleMeta.icon}
                <span>{roleMeta.label}</span>
              </div>
            </div>

            {/* Middle Section: Member Profile & ID */}
            <div className="relative py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={profile?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || profile?.user?.username || "Member")}&background=f59e0b&color=0f172a`}
                    alt="Member Avatar"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center text-gray-950">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    {profile?.display_name || profile?.user?.username || "SIB Member"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    {profile?.company_name || "Business Member"}
                  </p>
                </div>
              </div>

              {/* SIB Member ID Box */}
              <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-3.5 flex items-center justify-between sm:justify-start gap-4 self-stretch sm:self-auto">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    SIB Member ID
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-400 tracking-wider font-mono">
                    {idno}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyId(idno)}
                  className="p-2 rounded-xl bg-gray-700/60 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Bar: Joining Date & Renewal Date Countdown Badge */}
            <div className="relative pt-6 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Joining Date */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-800 text-gray-400 shrink-0">
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Joining Date
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-200">
                    {formatDate(joinDate)}
                  </span>
                </div>
              </div>

              {/* Renewal Date Countdown Badge */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-800 text-gray-400 shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Renewal Date
                    </span>
                    {daysRemaining !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        daysRemaining > 60
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : daysRemaining >= 0
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {daysRemaining >= 0 ? `${daysRemaining} Days Remaining` : "Renewal Due"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-200">
                    {formatDate(renewalDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-0.5">
                Official Chapter Membership Record
              </span>
              This badge verifies your active standing in {chapterName} ({chapterCode}). Keep your SIB Member ID handy for inter-chapter networking, regional conclaves, and business slips.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

