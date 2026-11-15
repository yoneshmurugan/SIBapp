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
  FileText,
  RefreshCw,
  ExternalLink
} from "lucide-react";

// Safe parser for amounts (MongoDB Decimal128, strings, numbers, objects)
export const parseAmount = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (typeof val === "object") {
    if (val.$numberDecimal !== undefined) {
      const parsed = parseFloat(val.$numberDecimal);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (val.totalBusiness !== undefined || val.total !== undefined) {
      return parseAmount(val.totalBusiness ?? val.total);
    }
  }
  if (typeof val === "string") {
    const clean = val.replace(/[^0-9.-]+/g, "");
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

export default function FunctionalPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active modal state: null or { type, prefill, comments, chapterId, crossChapter }
  const [modalState, setModalState] = useState(null);

  // Summary statistics
  const [stats, setStats] = useState({
    referral_given: 0,
    referral_received: 0,
    tyftb_given: 0,
    tyftb_received: 0,
    business_made: 0,
    M2Ms: 0,
    Visitors: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

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
        setStats({
          referral_given: Number(data.referral_given) || 0,
          referral_received: Number(data.referral_received) || 0,
          tyftb_given: Number(data.tyftb_given) || 0,
          tyftb_received: Number(data.tyftb_received) || 0,
          business_made: parseAmount(data.business_made),
          M2Ms: Number(data.M2Ms) || 0,
          Visitors: Number(data.Visitors) || 0
        });
      }
    } catch (err) {
      console.error("Failed to load slip stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle closing modal & refresh metrics
  const handleCloseModal = () => {
    setModalState(null);
    fetchStats();
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

  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-black/30 pb-20 transition-colors duration-300">
      <div className="sticky top-0 z-40">
        <Header />
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* Top Hero Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/40 border border-gray-200/80 dark:border-gray-800 p-4 sm:p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Chapter Business Desk</span>
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Referral Slips & Business Desk
              </h1>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Seamlessly pass client referrals, report closed revenue, record 1-on-1 strategic meetings, and introduce chapter visitors.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
              <Link
                to="/myactivity"
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all shadow-sm"
              >
                <span>Full Activity Ledger</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <button
                type="button"
                onClick={fetchStats}
                className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
                title="Refresh metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loadingStats ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Real-Time Slip Performance KPI Grid (2x2 on Mobile, 4x1 on Desktop) */}
          <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800/80 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            
            {/* KPI 1: Business Made */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5 sm:gap-3.5">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  TYB Revenue
                </p>
                <p className="text-sm sm:text-xl font-black text-gray-900 dark:text-white truncate">
                  ₹{parseAmount(stats.business_made).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* KPI 2: Referrals Passed */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5 sm:gap-3.5">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Referrals
                </p>
                <p className="text-sm sm:text-xl font-black text-gray-900 dark:text-white truncate">
                  {stats.referral_given || 0} <span className="text-[10px] sm:text-xs font-semibold text-gray-400">Given</span> · {stats.referral_received || 0} <span className="text-[10px] sm:text-xs font-semibold text-gray-400">Recv</span>
                </p>
              </div>
            </div>

            {/* KPI 3: M2Ms */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5 sm:gap-3.5">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  1-to-1 M2Ms
                </p>
                <p className="text-sm sm:text-xl font-black text-gray-900 dark:text-white truncate">
                  {stats.M2Ms || 0} <span className="text-[10px] sm:text-xs font-semibold text-gray-400">Sessions</span>
                </p>
              </div>
            </div>

            {/* KPI 4: Visitors */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5 sm:gap-3.5">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visitors Hosted
                </p>
                <p className="text-sm sm:text-xl font-black text-gray-900 dark:text-white truncate">
                  {stats.Visitors || 0} <span className="text-[10px] sm:text-xs font-semibold text-gray-400">Guests</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Action Cards Section */}
        <section className="space-y-3.5 sm:space-y-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Submit a Transaction Slip
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Select the appropriate slip type below to record business or chapter activities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {actionCards.map((card) => {
              const Icon = card.Icon;
              return (
                <div
                  key={card.type}
                  className={`group relative flex flex-col justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 ${card.borderAccent} shadow-sm hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="space-y-3 sm:space-y-4">
                    {/* Top Row: Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${card.iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border ${card.badgeClass}`}>
                        {card.badge}
                      </span>
                    </div>

                    {/* Card Title & Description */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="mt-1 sm:mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-4 sm:pt-6 mt-3 sm:mt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setModalState({ type: card.type })}
                      className={`w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 ${card.ctaBg}`}
                    >
                      <span>{card.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
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