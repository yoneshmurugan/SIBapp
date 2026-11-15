import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "../MainPage/Header";
import ReferralSlip from "./ReferalSlip";
import TYFTBSlip from "./TYFTBSlip";
import M2MSlip from "./M2MSlip";
import Visitors from "./Visitors";
import {
  Share2,
  IndianRupee,
  Users,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function FunctionalPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active modal state: null or { type, prefill, comments, chapterId, crossChapter }
  const [modalState, setModalState] = useState(null);

  // Summary statistics & recent submissions
  const [stats, setStats] = useState({
    referral_given: 0,
    referral_received: 0,
    tyftb_given: 0,
    tyftb_received: 0,
    business_made: 0,
    M2Ms: 0,
    Visitors: 0
  });
  const [recentSlips, setRecentSlips] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Auto-open modal if navigated with route state (e.g. from Push Notification or "Punch TYB" button)
  useEffect(() => {
    if (location.state?.action === 'OPEN_TYB') {
      setModalState({
        type: 'tyftb',
        prefill: location.state.referrerName || '',
        comments: location.state.prefillComments || '',
        chapterId: location.state.chapterId || '',
        crossChapter: location.state.crossChapter || false
      });
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.action === 'OPEN_M2M') {
      setModalState({
        type: 'm2m',
        prefill: location.state.partnerName || ''
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Fetch KPI statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/activity/getactivity`,
        { method: "GET", credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load slip stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch recent slips feed
  const fetchRecentSlips = useCallback(async () => {
    try {
      setLoadingRecent(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/activity/getfullactivity`,
        { method: "GET", credentials: "include" }
      );
      if (res.ok) {
        const apiData = await res.json();
        const formatted = [];

        if (Array.isArray(apiData.referral)) {
          apiData.referral.slice(0, 5).forEach((item) => {
            formatted.push({
              id: item._id,
              rawDate: item.created_at || item.createdAt,
              type: "REFERRAL",
              title: item.direction === "given"
                ? `Referral to ${item.referee?.name || item.contact_name || "Member"}`
                : `Referral from ${item.referrer?.name || "Member"}`,
              subtitle: item.description || item.contact_name || "Business Opportunity",
              direction: item.direction || "given",
              status: item.status ? "Verified" : "Pending",
              amount: null
            });
          });
        }

        if (Array.isArray(apiData.tyftb)) {
          apiData.tyftb.slice(0, 5).forEach((item) => {
            formatted.push({
              id: item._id,
              rawDate: item.created_at || item.createdAt,
              type: "TYB",
              title: item.direction === "given"
                ? `TYB to ${item.receiver?.name || "Member"}`
                : `TYB from ${item.payer?.name || "Member"}`,
              subtitle: item.business_description || "Closed Business",
              direction: item.direction || "given",
              status: item.status ? "Verified" : "Pending",
              amount: item.business_amount
            });
          });
        }

        if (Array.isArray(apiData.m2m)) {
          apiData.m2m.slice(0, 5).forEach((item) => {
            formatted.push({
              id: item._id,
              rawDate: item.createdAt,
              type: "M2M",
              title: `1-to-1 with ${item.direction === "given" ? (item.member2?.name || "Partner") : (item.member1?.name || "Partner")}`,
              subtitle: item.discussion_points || item.location || "Strategic 1-to-1",
              direction: item.direction || "given",
              status: item.status ? "Verified" : "Pending",
              amount: null
            });
          });
        }

        // Sort by recency and take top 6
        formatted.sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));
        setRecentSlips(formatted.slice(0, 6));
      }
    } catch (err) {
      console.error("Failed to load recent slips:", err);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRecentSlips();
  }, [fetchStats, fetchRecentSlips]);

  // Handle closing modal & refresh metrics
  const handleCloseModal = () => {
    setModalState(null);
    fetchStats();
    fetchRecentSlips();
  };

  // 4 Primary Action Cards Config
  const actionCards = useMemo(() => [
    {
      type: "referral",
      title: "Business Referral",
      badge: "Commercial Lead",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      borderAccent: "border-l-amber-500 hover:border-amber-400 dark:hover:border-amber-400",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      Icon: Share2,
      description: "Pass a pre-qualified business prospect or warm client introduction to a chapter or cross-chapter peer.",
      cta: "Punch Referral",
      ctaBg: "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-950 shadow-amber-500/15"
    },
    {
      type: "tyftb",
      title: "TYB Revenue Slip",
      badge: "Closed Revenue",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      borderAccent: "border-l-emerald-500 hover:border-emerald-400 dark:hover:border-emerald-400",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      Icon: IndianRupee,
      description: "Officially log closed deal revenue resulting from a member's referral to recognize verified chapter economic impact.",
      cta: "Log TYB Revenue",
      ctaBg: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/15"
    },
    {
      type: "m2m",
      title: "1-on-1 M2M Meeting",
      badge: "Strategic 1-to-1",
      badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      borderAccent: "border-l-indigo-500 hover:border-indigo-400 dark:hover:border-indigo-400",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      Icon: Users,
      description: "Document a completed bilateral strategic meeting to discover mutual synergies and refine targeted referral criteria.",
      cta: "Record M2M Meeting",
      ctaBg: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/15"
    },
    {
      type: "visitors",
      title: "Visitor Registration",
      badge: "Chapter Growth",
      badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      borderAccent: "border-l-sky-500 hover:border-sky-400 dark:hover:border-sky-400",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      Icon: UserPlus,
      description: "Register a prospective entrepreneur, director, or corporate guest attending your next weekly chapter assembly.",
      cta: "Register Visitor",
      ctaBg: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sky-500/15"
    }
  ], []);

  const formatSlipDate = (iso) => {
    if (!iso) return "Recent";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-black/30 pb-20 transition-colors duration-300">
      <div className="sticky top-0 z-40">
        <Header />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
        
        {/* Top Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/40 border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <FileText className="w-3.5 h-3.5" />
                <span>Chapter Business Desk</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Referral Slips & Business Desk
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Seamlessly pass client referrals, report closed revenue, record 1-on-1 strategic meetings, and introduce chapter visitors.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/myactivity"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all shadow-sm"
              >
                <span>Full Activity Ledger</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => { fetchStats(); fetchRecentSlips(); }}
                className="p-2.5 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
                title="Refresh metrics"
              >
                <RefreshCw className={`w-4 h-4 ${loadingStats || loadingRecent ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Real-Time Slip Performance KPI Grid */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Business Made */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  TYB Revenue
                </p>
                <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate">
                  ₹{Number(stats.business_made || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* KPI 2: Referrals Passed */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Referrals
                </p>
                <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate">
                  {stats.referral_given || 0} <span className="text-xs font-semibold text-gray-400">Given</span> · {stats.referral_received || 0} <span className="text-xs font-semibold text-gray-400">Recv</span>
                </p>
              </div>
            </div>

            {/* KPI 3: M2Ms */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  1-to-1 M2Ms
                </p>
                <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate">
                  {stats.M2Ms || 0} <span className="text-xs font-semibold text-gray-400">Sessions</span>
                </p>
              </div>
            </div>

            {/* KPI 4: Visitors */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visitors Hosted
                </p>
                <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate">
                  {stats.Visitors || 0} <span className="text-xs font-semibold text-gray-400">Guests</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Action Cards Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Submit a Transaction Slip
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Select the appropriate slip type below to record business or chapter activities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {actionCards.map((card) => {
              const Icon = card.Icon;
              return (
                <div
                  key={card.type}
                  className={`group relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 ${card.borderAccent} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${card.iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${card.badgeClass}`}>
                        {card.badge}
                      </span>
                    </div>

                    {/* Card Title & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setModalState({ type: card.type })}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 ${card.ctaBg}`}
                    >
                      <span>{card.cta}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Slips Ledger & Guidelines (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recent Slips Activity Feed (8 Cols) */}
          <section className="lg:col-span-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Recent Slip Submissions
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your latest transactions logged across the chapter
                  </p>
                </div>
              </div>

              <Link
                to="/myactivity"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingRecent && (
              <div className="py-12 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-2" />
                <p className="text-xs text-gray-400">Loading slip entries...</p>
              </div>
            )}

            {!loadingRecent && recentSlips.length === 0 && (
              <div className="py-12 text-center space-y-2">
                <FileText className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No slips recorded yet</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click any of the action cards above to submit your first referral, TYB revenue slip, or 1-to-1 meeting.
                </p>
              </div>
            )}

            {!loadingRecent && recentSlips.length > 0 && (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentSlips.map((item) => {
                  let typeBadgeClass = "bg-slate-500/10 text-slate-600 border-slate-500/20";
                  if (item.type === "REFERRAL") typeBadgeClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                  if (item.type === "TYB") typeBadgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                  if (item.type === "M2M") typeBadgeClass = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";

                  return (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${typeBadgeClass}`}>
                            {item.type}
                          </span>
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                            {formatSlipDate(item.rawDate)}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md">
                          {item.subtitle}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {item.amount !== null && (
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-1">
                            ₹{Number(item.amount).toLocaleString("en-IN")}
                          </p>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === "Verified" || item.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SIB Referral & Governance Protocol (4 Cols) */}
          <section className="lg:col-span-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Networking Standards
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Best practices for quality transactions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Rule 1 */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  1. Pre-Qualified Referrals
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Always confirm client permission before passing contact details to ensure high closing conversion.
                </p>
              </div>

              {/* Rule 2 */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  2. Prompt TYB Logging
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Log TYB revenue immediately upon payment receipt so chapter coordinators reflect accurate commercial volume.
                </p>
              </div>

              {/* Rule 3 */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  3. Bilateral Synergy
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Schedule regular 1-on-1 M2M meetings to educate fellow members on your ideal customer profile.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Slip Modal Handlers */}
      {modalState?.type === "referral" && (
        <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div className="w-full h-full max-w-[1600px] max-h-[100vh]">
              <div className="relative w-full h-full rounded-2xl overflow-auto p-2 sm:p-5">
                <ReferralSlip onClose={handleCloseModal} />
              </div>
            </div>
          </div>
        </div>
      )}

      {modalState?.type === "tyftb" && (
        <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div className="w-full h-full max-w-[1600px] max-h-[100vh]">
              <div className="relative w-full h-full rounded-2xl overflow-auto p-2 sm:p-5">
                <TYFTBSlip
                  onClose={handleCloseModal}
                  prefillTo={modalState.prefill}
                  prefillComments={modalState.comments}
                  prefillChapterId={modalState.chapterId}
                  prefillCrossChapter={modalState.crossChapter}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {modalState?.type === "m2m" && (
        <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div className="w-full h-full max-w-[1600px] max-h-[100vh]">
              <div className="relative w-full h-full rounded-2xl overflow-auto p-2 sm:p-5">
                <M2MSlip onClose={handleCloseModal} prefillPartner={modalState.prefill} />
              </div>
            </div>
          </div>
        </div>
      )}

      {modalState?.type === "visitors" && (
        <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div className="w-full h-full max-w-[1600px] max-h-[100vh]">
              <div className="relative w-full h-full rounded-2xl overflow-auto p-2 sm:p-5">
                <Visitors onClose={handleCloseModal} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}