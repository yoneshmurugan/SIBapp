import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, MessageCircle, Share2, ChevronDown, Loader2,
  MapPin, Mail, Calendar, Heart, Briefcase, Globe, Award, Star, Building2,
  User, Clock, DollarSign, Target, Quote, BookOpen
} from "lucide-react";
import { Share } from "@capacitor/share";
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

// ── Accordion Section ─────────────────────────────────────────
const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false, delay = 0 }) => {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div
      className="group relative rounded-[28px] border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:border-amber-500/30 active:border-amber-500/30 active:scale-[0.98] hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)] active:shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]"
      style={{ animation: `slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-full flex items-center justify-between px-6 py-5 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="relative flex items-center justify-center w-10 h-10 rounded-[14px] bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner group-hover:scale-110 group-active:scale-110 group-hover:bg-amber-500/20 group-active:bg-amber-500/20 transition-all duration-300">
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}
          <span className="text-[16px] font-black tracking-wide text-white/95">{title}</span>
        </div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] transition-all duration-500 ${open ? "rotate-180 bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "text-white/40"}`}>
          <ChevronDown size={18} strokeWidth={3} />
        </div>
      </button>
      
      <div className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) overflow-hidden ${open ? "max-h-[3000px] opacity-100 mb-2" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-6 pt-1 flex flex-col gap-1 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Detail Row ────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, valueClass = "", isLink = false, href = "#", index = 0 }) => {
  if (!value) return null;
  return (
    <div 
      className="flex items-start gap-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.05] active:bg-white/[0.05] active:scale-[0.99] -mx-3 px-3 rounded-2xl transition-all duration-300 cursor-pointer"
      style={{ animation: `slideLeftFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms both` }}
    >
      <div className="mt-1 shrink-0">
        {Icon ? <Icon size={18} strokeWidth={2.5} className="text-amber-500/70" /> : <div className="w-[18px] h-[18px]" />}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-0.5">{label}</span>
        {isLink ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={`text-[14px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/30 hover:decoration-amber-400 break-all transition-colors ${valueClass}`}>{value}</a>
        ) : (
          <span className={`text-[14px] font-bold text-white/90 leading-relaxed break-words block ${valueClass}`}>{value}</span>
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
      className={`inline-flex items-center px-4 py-2 rounded-xl text-[12px] font-black tracking-wide border ${colors[variant]} hover:scale-105 transition-transform duration-300`}
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
    <div className="mb-6 last:mb-0 relative">
      <div className="absolute -left-3 top-2 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/40 to-transparent rounded-full" />
      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-400/70 block mb-2">{title}</span>
      <p className="text-[14px] leading-[1.8] font-medium text-white/75 whitespace-pre-line">{content}</p>
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

  const { data: profileData, loading, error } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/public/getprofilebyid/${id}?user=${userId}`,
    { method: "GET", credentials: "include" }
  );

  const profile = useMemo(() => {
    if (!profileData || profileData.message) return null;
    return {
      ...profileData,
      dob: profileData.dob?.split("T")[0],
      wedding_date: profileData.wedding_date?.split("T")[0],
    };
  }, [profileData]);

  // Share handler
  const handleShare = async () => {
    const origin = "https://senguntharinbusiness.com";
    const shareUrl = `${origin}/profile/${id}?user=${userId}`;
    try {
      const canShareResult = await Share.canShare();
      if (canShareResult.value) {
        await Share.share({
          title: profile?.display_name || profile?.user?.username || "SIB Member Profile",
          text: `Check out ${profile?.display_name || profile?.user?.username}'s profile on SIB!`,
          url: shareUrl,
          dialogTitle: "Share Profile",
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
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
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-[24px] border border-amber-500/30 animate-spin-slow shadow-[0_0_20px_rgba(245,158,11,0.2)]" />
            <div className="absolute inset-2 rounded-[20px] border border-orange-500/30 animate-spin-reverse-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-pulse" />
            </div>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 text-[16px] font-black tracking-[0.2em] uppercase animate-pulse">Loading Profile</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 px-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <span className="text-red-500 text-3xl">⚠️</span>
        </div>
        <p className="text-white/70 text-[15px] font-bold text-center">Failed to load profile.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-full bg-white/5 text-white/90 font-bold tracking-wide active:scale-95 transition-all hover:bg-white/10">Go Back</button>
      </div>
    );
  }

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
  if (profile.company_name) stats.push({ value: profile.company_name, label: "Company" });

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-amber-500/30">

      {/* ═══ DYNAMIC BACKGROUND ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-amber-500/20 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[50%] bg-orange-500/15 rounded-full blur-[100px] animate-float-medium" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-rose-500/10 rounded-full blur-[100px] animate-float-fast" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10">
        {/* ═══ STICKY HEADER ═══ */}
        <header
          style={{ paddingTop: "env(safe-area-inset-top)" }}
          className="sticky top-0 z-50 bg-[#030303]/70 backdrop-blur-2xl border-b border-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between px-3 h-[60px]">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-full hover:bg-white/[0.08] active:bg-white/[0.12] active:scale-90 transition-all duration-300 cursor-pointer text-white/70 hover:text-white"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            
            <h1 className="text-[15px] font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
              Sengunthar in Business
            </h1>
            
            <button
              onClick={handleShare}
              className="p-3 rounded-full hover:bg-white/[0.08] active:bg-white/[0.12] active:scale-90 transition-all duration-300 cursor-pointer text-white/70 hover:text-white"
            >
              <Share2 size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* ═══ HERO SECTION ═══ */}
        <section className="relative px-6 pt-10 pb-12 flex flex-col items-center text-center">
          
          {/* Avatar with multiple pulsing rings */}
          <div className="relative mb-8" style={{ animation: "zoomIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}>
            <div className="absolute -inset-4 rounded-full border border-amber-500/20 animate-spin-slow" />
            <div className="absolute -inset-8 rounded-full border border-orange-500/10 animate-spin-reverse-slow" />
            
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 animate-pulse-fast blur-sm opacity-70" />
            
            <div className="relative w-[120px] h-[120px] rounded-full p-1 bg-[#050505] shadow-[0_0_40px_rgba(245,158,11,0.3)] group cursor-pointer hover:scale-105 transition-transform duration-500">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-amber-400/50 bg-gradient-to-br from-gray-800 to-[#050505]">
                    {initials}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name & Chapter & Company */}
          <div style={{ animation: "slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 200ms both" }}>
            <h2 className="text-[28px] md:text-[32px] font-black text-white leading-tight mb-2 tracking-tight">
              {name}
            </h2>

            {chapter && (
              <div className="flex justify-center mb-2">
                <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] bg-white/[0.05] text-amber-400 border border-white/[0.1] shadow-lg backdrop-blur-sm">
                  {chapter}
                </span>
              </div>
            )}
            
            {profile.company_name && (
              <h3 className="text-[18px] font-extrabold text-amber-300 mb-3 drop-shadow-md">
                {profile.company_name}
              </h3>
            )}
            
            {email && <p className="text-[13px] text-white/40 font-medium tracking-wide mb-8">{email}</p>}
          </div>

          {/* ─── Action Buttons ─── */}
          <div 
            className="flex items-center justify-center gap-4 w-full max-w-[320px]"
            style={{ animation: "slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 300ms both" }}
          >
            {phone && (
              <a
                href={callLink}
                className="group relative flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-black text-[14px] overflow-hidden active:scale-95 transition-all duration-300 hover:bg-white/[0.08]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  <Phone size={16} strokeWidth={3} />
                </div>
                Call
              </a>
            )}
            {phone && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-black text-[14px] overflow-hidden active:scale-95 transition-all duration-300 hover:bg-white/[0.08]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="p-1.5 rounded-full bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                  <MessageCircle size={16} strokeWidth={3} />
                </div>
                Message
              </a>
            )}
          </div>
        </section>

        {/* ═══ QUICK STATS (No Icons) ═══ */}
        {stats.length > 0 && (
          <section className="px-5 mb-8" style={{ animation: "fadeIn 0.8s ease-out 400ms both" }}>
            <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x">
              {stats.map((s, i) => (
                <div 
                  key={i} 
                  className="snap-center flex-shrink-0 flex flex-col justify-center px-5 py-4 rounded-[20px] bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.05] min-w-[100px] shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/30 transition-colors duration-300"
                  style={{ animation: `slideLeftFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${400 + (i * 100)}ms both` }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors duration-500" />
                  <span className="text-[20px] font-black text-white leading-none mb-1.5 tracking-tight">{s.value}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/80">{s.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ CONTENT SECTIONS ═══ */}
        <div className="px-5 pb-16 flex flex-col gap-4" style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" }}>

          {/* ── Personal Details ── */}
          <AccordionSection title="Personal Details" icon={User} defaultOpen={true} delay={500}>
            <DetailRow index={0} icon={Phone} label="Phone" value={phone} />
            <DetailRow index={1} icon={Mail} label="Email" value={email} />
            <DetailRow index={2} icon={MapPin} label="Address" value={profile.company_address} valueClass="whitespace-normal" />
            <DetailRow index={3} icon={Calendar} label="Date of Birth" value={formatDate(profile.dob)} />
            <DetailRow index={4} icon={Calendar} label="Wedding Date" value={formatDate(profile.wedding_date)} />
            <DetailRow index={5} icon={Heart} label="Blood Group" value={profile.blood_group} />
            <DetailRow index={6} label="வகையறா (Vagai)" value={profile.vagai_category} />
            <DetailRow index={7} label="கூட்டம் (Kootam)" value={profile.kulam_category} />
            <DetailRow index={8} label="ஊர் (Native Place)" value={profile.native_place} />
            <DetailRow index={9} label="குலதெய்வம் (Kuladeivam)" value={profile.kuladeivam} valueClass="text-rose-400" />
          </AccordionSection>

          {/* ── Professional Details ── */}
          <AccordionSection title="Professional Details" icon={Briefcase} defaultOpen={false} delay={600}>
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

            {/* Verticals */}
            {verticals.length > 0 && (
              <div className="pt-4 pb-2 border-b border-white/[0.04]">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-3 block">Verticals</span>
                <div className="flex flex-wrap gap-2.5">
                  {verticals.map((v, i) => <TagChip key={i} index={i} variant="purple">{v}</TagChip>)}
                </div>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="pt-4 pb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-3 block">Services Offered</span>
                <div className="flex flex-wrap gap-2.5">
                  {services.map((s, i) => <TagChip key={i} index={i} variant="amber">{s}</TagChip>)}
                </div>
              </div>
            )}
          </AccordionSection>

          {/* ── GAINS Profile ── */}
          {profile.bio && (
            <AccordionSection title="GAINS Profile" icon={Star} defaultOpen={false} delay={700}>
              <BioBlock title="Overview" content={profile.bio} />
            </AccordionSection>
          )}

          {/* ── 30-sec Elevator Pitch ── */}
          {profile.elevator_pitch_30s && (
            <AccordionSection title="Elevator Pitch" icon={Quote} defaultOpen={false} delay={800}>
              <BioBlock title="30 Seconds" content={profile.elevator_pitch_30s} />
            </AccordionSection>
          )}

          {/* ── Why SIB? ── */}
          {profile.why_sib && (
            <AccordionSection title="Why SIB?" icon={Award} defaultOpen={false} delay={900}>
              <BioBlock title="My Journey" content={profile.why_sib} />
            </AccordionSection>
          )}
        </div>
      </div>

      {/* ═══ GLOBAL STYLES & KEYFRAMES ═══ */}
      <style>{`
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeftFade {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoomInFade {
          0% { opacity: 0; transform: scale(0.9); }
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

        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 12s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 10s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-spin-reverse-slow { animation: spin-reverse-slow 15s linear infinite; }
        .animate-pulse-fast { animation: pulse-fast 2s ease-in-out infinite; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
