import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, MessageCircle, Share2, Loader2,
  MapPin, Mail, Calendar, Heart, Briefcase, Globe, Award, Star, Building2,
  User, Clock, DollarSign, Target, Quote, BookOpen, Crown
} from "lucide-react";
import clsx from 'clsx';
import useFetch from "../hooks/useFetch";

// ── Helpers ──────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const cleanPhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length >= 12) return digits;
  if (digits.length === 10) return "91" + digits;
  return digits;
};

// ── Card Section ─────────────────────────────────────────
const CardSection = ({ title, icon: Icon, children, delay = 0, className = "" }) => {
  return (
    <div
      className={`group relative rounded-[28px] border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] ${className}`}
      style={{ animation: `slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative px-6 py-5 border-b border-white/[0.04] bg-white/[0.02]">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="relative flex items-center justify-center w-10 h-10 rounded-[14px] bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}
          <h3 className="text-[18px] font-black tracking-wide text-white/95">{title}</h3>
        </div>
      </div>
      
      <div className="relative p-6 z-10 flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
};

// ── Detail Row ────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, valueClass = "", isLink = false, href = "#", index = 0 }) => {
  if (!value) return null;
  return (
    <div 
      className="flex items-start gap-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.05] -mx-3 px-3 rounded-2xl transition-all duration-300 cursor-pointer"
      style={{ animation: `slideLeftFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms both` }}
    >
      <div className="mt-1 shrink-0">
        {Icon ? <Icon size={18} strokeWidth={2.5} className="text-amber-500/70" /> : <div className="w-[18px] h-[18px]" />}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30 mb-0.5">{label}</span>
        {isLink ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={`text-[15px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/30 hover:decoration-amber-400 break-all transition-colors ${valueClass}`}>{value}</a>
        ) : (
          <span className={`text-[15px] font-bold text-white/90 leading-relaxed break-words block ${valueClass}`}>{value}</span>
        )}
      </div>
    </div>
  );
};

// ── Tag Chip ─────────────────────────────────────────────────
const TagChip = ({ children, variant = "amber", index = 0 }) => {
  const colors = {
    amber: "bg-gradient-to-br from-amber-500/10 to-amber-600/5 text-amber-300 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]",
    purple: "bg-gradient-to-br from-purple-500/10 to-purple-600/5 text-purple-300 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.05)]",
  };
  return (
    <span 
      className={`inline-flex items-center px-4 py-2 rounded-xl text-[13px] font-black tracking-wide border ${colors[variant]} hover:scale-105 transition-transform duration-300 cursor-default`}
      style={{ animation: `zoomInFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms both` }}
    >
      {children}
    </span>
  );
};

// ── Bio Block ────────────────────────────────────────────────
const BioBlock = ({ title, content }) => {
  if (!content) return null;
  return (
    <div className="mb-6 last:mb-0 relative hover:pl-2 transition-all duration-300">
      <div className="absolute -left-3 top-2 bottom-0 w-[3px] bg-gradient-to-b from-amber-500/50 to-transparent rounded-full" />
      <span className="text-[12px] font-black uppercase tracking-[0.15em] text-amber-400/80 block mb-3">{title}</span>
      <p className="text-[15px] leading-[1.8] font-medium text-white/80 whitespace-pre-line">{content}</p>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ██ MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function ViewProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get("user");

  const isDummyUser = id?.startsWith('dummy-');

  const { data: profileDataResponse, loading: profileLoading, error: profileError } = useFetch(
    isDummyUser ? null : `${import.meta.env.VITE_BACKEND_SERVER}/public/getprofilebyid/${id}?user=${userId}`,
    { method: "GET", credentials: "include" }
  );

  const { data: userBadgesDataResponse } = useFetch(
    (isDummyUser || !profileDataResponse?.user?._id) ? null : `${import.meta.env.VITE_BACKEND_SERVER}/gamification/user-badges/${profileDataResponse.user._id}`,
    { method: "GET", credentials: "include" }
  );

  const mockProfileData = useMemo(() => isDummyUser ? {
    display_name: "Meenakshi S",
    company_name: "KK Traders",
    profile_image_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=SIB3&backgroundColor=b6e3f4",
    user: { _id: "dummy-user-3", username: "Meenakshi S", email: "meenakshi@kktraders.com" },
    company_phone: "9876543210",
    chaptername: "Mannar Chandramathy Chapter",
    years_in_business: 8,
    blood_group: "O+",
    annual_turnover: 2500000,
    services: ["Wholesale Trading", "Distribution", "Retail Supply"],
    business_description: "Leading wholesale traders in the region with over 8 years of excellence. We provide high-quality goods at the best competitive prices with a massive network of distributors.",
    business_address: "123 Market Street, Trading Hub, City",
    website: "https://kktraders.example.com",
    vertical_names: ["Trading", "Wholesale"]
  } : null, [isDummyUser]);

  const mockBadges = useMemo(() => isDummyUser ? [
    { badge_type: 'month_winner', awarded_at: new Date().toISOString() },
    { badge_type: 'runner_up', awarded_at: new Date().toISOString() },
    { badge_type: 'highest_referral', awarded_at: new Date().toISOString() },
    { badge_type: 'highest_m2m', awarded_at: new Date().toISOString() },
    { badge_type: 'highest_tyb', awarded_at: new Date().toISOString() },
    { badge_type: 'full_attendance', awarded_at: new Date().toISOString() }
  ] : [], [isDummyUser]);

  const profileData = isDummyUser ? mockProfileData : profileDataResponse;
  const loading = isDummyUser ? false : profileLoading;
  const error = isDummyUser ? null : profileError;
  
  console.log("DEBUG ViewProfile", { id, isDummyUser, profileData, mockProfileData, error });

  const userBadges = useMemo(() => {
    if (isDummyUser) return mockBadges;
    if (!userBadgesDataResponse || userBadgesDataResponse.error) return [];
    return userBadgesDataResponse;
  }, [userBadgesDataResponse, isDummyUser, mockBadges]);

  // Share handler
  const handleShare = async () => {
    const origin = "https://senguntharinbusiness.com";
    const shareUrl = `${origin}/profile/${id}?user=${userId}`;
    const shareData = {
      title: profile?.display_name || profile?.user?.username || "SIB Member Profile",
      text: `Check out ${profile?.display_name || profile?.user?.username}'s profile on SIB!`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Profile link copied to clipboard!");
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-8" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {/* Dynamic Background for Loader */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
          <div className="absolute w-[300px] h-[300px] bg-amber-500/20 rounded-full blur-[100px] animate-pulse-fast" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-[28px] border border-amber-500/30 animate-spin-slow shadow-[0_0_20px_rgba(245,158,11,0.2)]" />
            <div className="absolute inset-2 rounded-[24px] border border-orange-500/30 animate-spin-reverse-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-pulse" />
            </div>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 text-[18px] font-black tracking-[0.2em] uppercase animate-pulse">Loading Profile</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 px-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <span className="text-red-500 text-4xl">⚠️</span>
        </div>
        <p className="text-white/70 text-[18px] font-bold text-center">Failed to load profile.</p>
        <button onClick={() => navigate(-1)} className="px-8 py-4 rounded-full bg-white/5 text-white/90 font-bold tracking-wide hover:bg-white/10 active:scale-95 transition-all">Go Back</button>
      </div>
    );
  }

  const profile = profileData;

  const name = profile.display_name || profile.user?.username || "SIB Member";
  const email = profile.company_email || profile.user?.email || "";
  const phone = profile.company_phone || "";
  const avatar = profile.profile_image_url;
  const chapter = profile.chaptername || profile.chapter_name || "";
  const services = profile.services || [];
  const verticals = profile.vertical_names || [];
  const initials = name.trim().split(" ").map(n => n[0] || "").join("").toUpperCase().slice(0, 2);
  const whatsappLink = phone ? `https://wa.me/${cleanPhone(phone)}` : "#";
  const callLink = phone ? `tel:${phone}` : "#";

  // Build quick stats array
  const stats = [];
  if (profile.years_in_business > 0) stats.push({ value: profile.years_in_business, label: "Years" });
  if (profile.blood_group) stats.push({ value: profile.blood_group, label: "Blood" });
  if (profile.annual_turnover > 0) stats.push({ value: `₹${(profile.annual_turnover / 100000).toFixed(1)}L`, label: "Turnover" });

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-amber-500/30 overflow-x-hidden">

      {/* ═══ DYNAMIC BACKGROUND ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-amber-500/20 rounded-full blur-[150px] animate-float-slow" />
        <div className="absolute top-[30%] right-[-10%] w-[50%] h-[60%] bg-orange-500/15 rounded-full blur-[150px] animate-float-medium" />
        <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[50%] bg-rose-500/10 rounded-full blur-[150px] animate-float-fast" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ═══ HEADER ═══ */}
        <header
          className="sticky top-0 z-50 bg-[#030303]/70 backdrop-blur-3xl border-b border-white/[0.05] shadow-[0_4px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 h-[80px]">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="p-3 rounded-full hover:bg-white/[0.1] active:bg-white/[0.15] active:scale-90 transition-all duration-300 cursor-pointer text-white/70 hover:text-white flex items-center gap-2 group"
              >
                <ArrowLeft size={24} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline font-bold text-[15px]">Back</span>
              </button>
            </div>
            
            <h1 className="text-[20px] md:text-[24px] font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
              Sengunthar in Business
            </h1>
            
            <button
              onClick={handleShare}
              className="p-3 rounded-full hover:bg-white/[0.1] active:bg-white/[0.15] active:scale-90 transition-all duration-300 cursor-pointer text-white/70 hover:text-white flex items-center gap-2 group"
            >
              <span className="hidden sm:inline font-bold text-[15px]">Share Profile</span>
              <Share2 size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>

        {/* ═══ MAIN LAYOUT (DESKTOP OPTIMIZED) ═══ */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ── SIDEBAR (Col 1-4) ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-[120px] flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
              
              {/* Avatar */}
              <div className="relative w-full flex justify-center lg:justify-start" style={{ animation: "zoomIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}>
                <div className="absolute -inset-6 rounded-full border border-amber-500/20 animate-spin-slow w-[200px] h-[200px] lg:w-[240px] lg:h-[240px] hidden lg:block" />
                <div className="absolute -inset-10 rounded-full border border-orange-500/10 animate-spin-reverse-slow w-[232px] h-[232px] lg:w-[272px] lg:h-[272px] hidden lg:block" />
                
                <div className="absolute -inset-[5px] rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 animate-pulse-fast blur-md opacity-70 w-[160px] h-[160px] lg:w-[200px] lg:h-[200px]" />
                
                <div className="relative w-[150px] h-[150px] lg:w-[190px] lg:h-[190px] rounded-full p-1.5 bg-[#050505] shadow-[0_0_50px_rgba(245,158,11,0.3)] group cursor-pointer hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-900 border-2 border-white/5">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-black text-amber-400/50 bg-gradient-to-br from-gray-800 to-[#050505]">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Title */}
              <div style={{ animation: "slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 200ms both" }} className="w-full flex flex-col items-center lg:items-start">
                <h2 className="text-[32px] lg:text-[42px] font-black text-white leading-tight mb-4 tracking-tight drop-shadow-xl">
                  {name}
                </h2>

                <div className="flex flex-col lg:items-start items-center gap-3 mb-6">
                  {chapter && (
                    <span className="px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.2em] bg-white/[0.05] text-amber-400 border border-white/[0.1] shadow-lg backdrop-blur-md">
                      {chapter}
                    </span>
                  )}
                  {profile.company_name && (
                    <h3 className="text-[20px] lg:text-[24px] font-extrabold text-amber-300 drop-shadow-md">
                      {profile.company_name}
                    </h3>
                  )}
                </div>
                
                {email && (
                  <div className="flex items-center gap-3 text-white/50 bg-white/5 px-5 py-3 rounded-xl border border-white/10 w-full justify-center lg:justify-start">
                    <Mail size={18} className="text-amber-500/70" />
                    <p className="text-[14px] font-bold tracking-wide truncate">{email}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div 
                className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full"
                style={{ animation: "slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 300ms both" }}
              >
                {phone && (
                  <a
                    href={callLink}
                    className="group relative flex-1 flex items-center justify-center gap-4 py-5 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-black text-[16px] overflow-hidden active:scale-95 hover:-translate-y-1 transition-all duration-300 hover:bg-white/[0.08] hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                      <Phone size={20} strokeWidth={3} />
                    </div>
                    Call Now
                  </a>
                )}
                {phone && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex-1 flex items-center justify-center gap-4 py-5 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-black text-[16px] overflow-hidden active:scale-95 hover:-translate-y-1 transition-all duration-300 hover:bg-white/[0.08] hover:shadow-[0_10px_30px_-10px_rgba(34,197,94,0.2)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="p-2 rounded-full bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                      <MessageCircle size={20} strokeWidth={3} />
                    </div>
                    Message
                  </a>
                )}
              </div>

              {/* Quick Stats Grid */}
              {stats.length > 0 && (
                <div 
                  className="grid grid-cols-2 lg:grid-cols-1 gap-4 w-full mt-4" 
                  style={{ animation: "fadeIn 0.8s ease-out 400ms both" }}
                >
                  {stats.map((s, i) => (
                    <div 
                      key={i} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between px-6 py-5 rounded-[24px] bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.05] shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-amber-500/30 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1"
                      style={{ animation: `slideLeftFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${400 + (i * 100)}ms both` }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors duration-500" />
                      <span className="text-[12px] font-black uppercase tracking-[0.2em] text-amber-400/80 mb-2 lg:mb-0 relative z-10">{s.label}</span>
                      <span className="text-[24px] font-black text-white leading-none tracking-tight relative z-10">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── MAIN CONTENT (Col 5-12) ── */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ── Personal Details ── */}
                <CardSection title="Personal Details" icon={User} delay={500}>
                  <DetailRow index={0} icon={Phone} label="Phone" value={phone} />
                  <DetailRow index={1} icon={MapPin} label="Address" value={profile.company_address} valueClass="whitespace-normal" />
                  <DetailRow index={2} icon={Calendar} label="Date of Birth" value={formatDate(profile.dob)} />
                  <DetailRow index={3} icon={Calendar} label="Wedding Date" value={formatDate(profile.wedding_date)} />
                  <DetailRow index={4} icon={Heart} label="Blood Group" value={profile.blood_group} />
                  <DetailRow index={5} label="வகையறா (Vagai)" value={profile.vagai_category} />
                  <DetailRow index={6} label="கூட்டம் (Kootam)" value={profile.kulam_category} />
                  <DetailRow index={7} label="ஊர் (Native Place)" value={profile.native_place} />
                  <DetailRow index={8} label="குலதெய்வம் (Kuladeivam)" value={profile.kuladeivam} valueClass="text-rose-400" />
                </CardSection>

                {/* ── Professional Details ── */}
                <div className="flex flex-col gap-8">
                  <CardSection title="Professional Details" icon={Briefcase} delay={600}>
                    <DetailRow index={0} icon={Building2} label="Company Name" value={profile.company_name} />
                    {profile.website && (
                      <DetailRow
                        index={1}
                        icon={Globe}
                        label="Website"
                        value={profile.website}
                        isLink={true}
                        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      />
                    )}
                    <DetailRow index={2} icon={Clock} label="Years in Business" value={profile.years_in_business > 0 ? `${profile.years_in_business} years` : null} />
                    <DetailRow index={3} icon={DollarSign} label="Annual Turnover" value={profile.annual_turnover > 0 ? `₹${profile.annual_turnover.toLocaleString("en-IN")}` : null} />
                    <DetailRow index={4} icon={Target} label="Ideal Referral" value={profile.ideal_referral} valueClass="whitespace-normal" />
                  </CardSection>

                  {/* Verticals & Services merged into one card for better layout */}
                  {(verticals.length > 0 || services.length > 0) && (
                    <CardSection title="Expertise & Services" icon={Award} delay={700}>
                      {verticals.length > 0 && (
                        <div className="mb-6">
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 block">Verticals</span>
                          <div className="flex flex-wrap gap-3">
                            {verticals.map((v, i) => <TagChip key={i} index={i} variant="purple">{v}</TagChip>)}
                          </div>
                        </div>
                      )}
                      
                      {services.length > 0 && (
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 block">Services Offered</span>
                          <div className="flex flex-wrap gap-3">
                            {services.map((s, i) => <TagChip key={i} index={i} variant="amber">{s}</TagChip>)}
                          </div>
                        </div>
                      )}
                    </CardSection>
                  )}
                </div>
              </div>

              {/* ── Achievements (Gamification) ── */}
              {userBadges && userBadges.length > 0 && (
                <CardSection title="Achievements" icon={Award} delay={750} className="w-full">
                  <div className="flex flex-wrap gap-4 py-2">
                    {(() => {
                      const groupedBadgesMap = new Map();
                      userBadges.forEach(badge => {
                        if (!groupedBadgesMap.has(badge.badge_type)) {
                          groupedBadgesMap.set(badge.badge_type, { count: 1, lastAwarded: badge.awarded_at, month: badge.month, year: badge.year });
                        } else {
                          const existing = groupedBadgesMap.get(badge.badge_type);
                          existing.count += 1;
                          if (new Date(badge.awarded_at) > new Date(existing.lastAwarded)) {
                            existing.lastAwarded = badge.awarded_at;
                            existing.month = badge.month;
                            existing.year = badge.year;
                          }
                        }
                      });

                      const groupedBadges = Array.from(groupedBadgesMap.entries()).map(([type, data]) => ({ badge_type: type, ...data }));

                      return groupedBadges.map((badge, idx) => {
                        let colors, subtitle, label;
                        if (badge.badge_type === 'highest_referral') {
                          colors = "from-blue-500/10 to-indigo-500/10 border-blue-500/20";
                          subtitle = "Top Referrer";
                          label = "Highest Referrals";
                        } else if (badge.badge_type === 'highest_m2m') {
                          colors = "from-amber-500/10 to-orange-500/10 border-amber-500/20";
                          subtitle = "Top Networker";
                          label = "Highest M2M";
                        } else if (badge.badge_type === 'highest_tyb') {
                          colors = "from-green-500/10 to-emerald-500/10 border-green-500/20";
                          subtitle = "Top Giver";
                          label = "Highest TYB";
                        } else if (badge.badge_type === 'perfect_attendance' || badge.badge_type === 'full_attendance') {
                          colors = "from-purple-500/10 to-pink-500/10 border-purple-500/20";
                          subtitle = "100%";
                          label = "Full Attendance";
                        } else if (badge.badge_type === 'month_winner') {
                          colors = "from-yellow-500/10 to-amber-600/10 border-yellow-500/20";
                          subtitle = "1st Place";
                          label = "Month Winner";
                        } else if (badge.badge_type === 'runner_up') {
                          colors = "from-gray-400/10 to-gray-500/10 border-gray-400/20";
                          subtitle = "2nd Place";
                          label = "Runner Up";
                        } else {
                          colors = "from-gray-500/10 to-slate-500/10 border-gray-500/20";
                          subtitle = "Achiever";
                          label = badge.badge_type;
                        }
                        
                        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                        const monthName = badge.month && badge.year 
                          ? `${monthNames[badge.month - 1]} ${badge.year}` 
                          : new Date(badge.lastAwarded).toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase();
                        
                        let badgeTypeKey = badge.badge_type;
                        if (badgeTypeKey === 'perfect_attendance') badgeTypeKey = 'full_attendance';

                        return (
                          <div key={idx} className={clsx("flex flex-col items-center text-center gap-3 border p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer group bg-gradient-to-br w-40", colors)}>
                            <div className="relative">
                              <img 
                                src={`/assets/badges/${badgeTypeKey}.png`} 
                                alt={label} 
                                className="w-16 h-16 rounded-full object-cover shadow-lg drop-shadow-md border-[1.5px] border-gray-700/50 bg-gray-900 group-hover:border-amber-400/50 transition-colors duration-300"
                              />
                              {badge.count > 1 && (
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[11px] font-black min-w-[22px] h-[22px] flex items-center justify-center rounded-full border border-gray-900 shadow-sm px-1">
                                  {badge.count}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-[13px] leading-tight mb-1">{label}</h4>
                              <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">{subtitle}</p>
                              <p className="text-amber-500/80 text-[9px] font-black uppercase tracking-widest mt-0.5">{monthName}</p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardSection>
              )}

              {/* ── Bio Sections (Full Width) ── */}
              {(profile.bio || profile.elevator_pitch_30s || profile.why_sib) && (
                <CardSection title="About Me" icon={BookOpen} delay={800} className="w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-4">
                    {profile.bio && (
                      <BioBlock title="GAINS Profile" content={profile.bio} />
                    )}
                    <div className="flex flex-col gap-8">
                      {profile.elevator_pitch_30s && (
                        <BioBlock title="30-sec Elevator Pitch" content={profile.elevator_pitch_30s} />
                      )}
                      {profile.why_sib && (
                        <BioBlock title="Why SIB?" content={profile.why_sib} />
                      )}
                    </div>
                  </div>
                </CardSection>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ═══ GLOBAL STYLES & KEYFRAMES ═══ */}
      <style>{`
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeftFade {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoomInFade {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes zoomIn {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(5%, 10%) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-5%, 8%) rotate(-5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, -8%) scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 12s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-spin-reverse-slow { animation: spin-reverse-slow 20s linear infinite; }
        .animate-pulse-fast { animation: pulse-fast 3s ease-in-out infinite; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
