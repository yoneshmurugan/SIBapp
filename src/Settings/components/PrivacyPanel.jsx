import React, { useState, useEffect } from "react";
import { 
  HeartHandshake, 
  Droplet, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

export default function PrivacyPanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDonor, setIsDonor] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    // 1. Try reading cached profile data
    try {
      const cached = localStorage.getItem("header_user_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
        setIsDonor(Boolean(parsed?.emergency_blood_donor));
        setLoading(false);
      }
    } catch (e) {
      console.warn("Failed to read cached profile", e);
    }

    // 2. Fetch fresh profile from backend
    fetch(`${import.meta.env.VITE_BACKEND_SERVER}/profile/getprofile`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setProfile(data);
          setIsDonor(Boolean(data.emergency_blood_donor));
          try {
            localStorage.setItem("header_user_profile", JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch((err) => console.warn("Failed to fetch profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleDonor = async () => {
    const nextState = !isDonor;
    setIsDonor(nextState);
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/profile/updateprofile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emergency_blood_donor: nextState }),
      });

      const updated = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: nextState
            ? "Thank you! You are now listed as an available emergency blood donor."
            : "You have been unlisted from the emergency blood donor network."
        });

        // Update local storage cache
        try {
          const cached = localStorage.getItem("header_user_profile");
          if (cached) {
            const parsed = JSON.parse(cached);
            parsed.emergency_blood_donor = nextState;
            localStorage.setItem("header_user_profile", JSON.stringify(parsed));
          }
        } catch (e) {}
      } else {
        setIsDonor(!nextState); // Revert
        setFeedback({ type: "error", message: updated.error || "Failed to update blood donor preference." });
      }
    } catch (err) {
      setIsDonor(!nextState); // Revert
      setFeedback({ type: "error", message: "Network error. Unable to save preference." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const bloodGroup = profile?.blood_group || "A+";

  return (
    <div className="space-y-6">
      {/* Emergency Blood Donor Card */}
      <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md transition-all">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wide flex items-center gap-2">
              Privacy & Emergency Services
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage your community directory opt-ins and emergency contact participation.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold self-start sm:self-auto">
            <HeartHandshake className="w-3.5 h-3.5" />
            Community Support
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mb-6 rounded-2xl border p-4 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}>
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 text-rose-500 animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Loading preferences...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Blood Donor Toggle Box */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                  <Droplet className="w-6 h-6 fill-rose-500/30" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Emergency Blood Donor Opt-in
                    </h3>
                    {/* Blood Group Pill */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black tracking-wide">
                      {bloodGroup}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed max-w-xl">
                    List me as an available emergency blood donor (uses blood group <strong className="text-rose-400">{bloodGroup}</strong> from your profile for urgent community requests).
                  </p>
                </div>
              </div>

              {/* Interactive Switch */}
              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {saving ? "Saving..." : isDonor ? "Enrolled" : "Off"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDonor}
                  disabled={saving}
                  onClick={handleToggleDonor}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500/30 disabled:opacity-50 ${
                    isDonor ? "bg-rose-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isDonor ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Explanatory Note */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex items-start gap-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100 block mb-0.5">
                  How Emergency Requests Work
                </span>
                When a fellow SIB chapter member or their family requires urgent blood in your region, chapter coordinators can reach out to verified donors with matching blood groups. Your personal contact details are never shown publicly outside the authenticated chapter directory.
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Collapsible Privacy Policy */}
      <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPolicy(!showPolicy)}
          className="w-full px-6 sm:px-8 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Official Privacy Policy
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last updated November 18, 2025 • Read our compliance and data safety guidelines
              </p>
            </div>
          </div>
          {showPolicy ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showPolicy && (
          <div className="p-6 sm:p-8 border-t border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
            <p>
              Welcome to SIB - Sengunthar in Business ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information when using our web and mobile applications.
            </p>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">1. Information We Collect</h4>
            <p>
              We collect information provided directly by members during registration and onboarding, including name, email address, phone number, chapter membership ID, company details, business categories, meeting attendance records, and blood group for community emergency requests.
            </p>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">2. Use of Information</h4>
            <p>
              Your information is exclusively used to facilitate member-to-member business networking, slip transactions (Referrals, 1-to-1 meetings, Thank You for the Business), chapter attendance recording, gamification leaderboards, and urgent emergency blood assistance.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
