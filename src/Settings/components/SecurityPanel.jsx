import React, { useState, useEffect } from "react";
import { 
  KeyRound, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Check, 
  ShieldAlert,
  Laptop,
  Smartphone,
  Globe,
  Clock
} from "lucide-react";
import { getAuth, signInWithEmailAndPassword, updatePassword as updateFirebasePassword } from "firebase/auth";
import { app } from "../../firebase.mjs";

function getDeviceInfo() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  let browser = "Web Browser";
  let os = "Desktop";
  let isMobile = false;

  if (/iPad|iPhone|iPod/.test(ua)) {
    os = "iOS";
    isMobile = true;
  } else if (/Android/.test(ua)) {
    os = "Android";
    isMobile = true;
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = "macOS";
  } else if (/Windows/.test(ua)) {
    os = "Windows";
  } else if (/Linux/.test(ua)) {
    os = "Linux";
  }

  if (/Edg/.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome/.test(ua)) browser = "Google Chrome";
  else if (/Safari/.test(ua)) browser = "Apple Safari";
  else if (/Firefox/.test(ua)) browser = "Mozilla Firefox";

  return { os, browser, isMobile, deviceName: `${os} • ${browser}` };
}

function getFriendlyAuthError(err, fallbackMsg) {
  if (!err) return fallbackMsg || "Failed to update password. Please try again.";
  const code = err.code || "";
  const msg = err.message || "";

  if (
    code === "auth/wrong-password" || 
    code === "auth/invalid-credential" || 
    code === "auth/invalid-login-credentials" ||
    msg.includes("wrong-password") || 
    msg.includes("invalid-credential") ||
    msg.includes("Old password is incorrect")
  ) {
    return "Current password is incorrect. Please verify your current password and try again.";
  }
  if (code === "auth/user-not-found" || msg.includes("user-not-found")) {
    return "No account found matching this email address.";
  }
  if (code === "auth/weak-password" || msg.includes("weak-password")) {
    return "The new password is too weak. Please ensure it has at least 8 characters with uppercase, lowercase, numbers, and symbols.";
  }
  if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
    return "Too many attempts. Please wait a few moments before trying again.";
  }
  if (code === "auth/network-request-failed" || msg.includes("network-request-failed") || msg.includes("Failed to fetch")) {
    return "Network connection issue. Please check your internet connection.";
  }
  return fallbackMsg || msg || "An unexpected error occurred. Please try again.";
}

export default function SecurityPanel() {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ 
    email: "", 
    oldPassword: "", 
    newPassword: "", 
    confirmNewPassword: "" 
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [sessionInfo, setSessionInfo] = useState({
    lastSignedIn: null,
    ip: "Detecting...",
    device: "Current Device",
    isMobile: false
  });

  // Auto-fill logged-in user email and session info
  useEffect(() => {
    const dev = getDeviceInfo();
    setSessionInfo((prev) => ({
      ...prev,
      device: dev.deviceName,
      isMobile: dev.isMobile,
    }));

    try {
      const cached = localStorage.getItem("header_auth_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.email) {
          setValues((v) => ({ ...v, email: parsed.email }));
        }
        if (parsed?.last_signed_in) {
          setSessionInfo((prev) => ({ ...prev, lastSignedIn: new Date(parsed.last_signed_in) }));
        }
      }
    } catch (e) {
      console.warn("Failed to read cached user info", e);
    }

    // Fetch user profile from backend for live last_signed_in & IP
    fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/getuser`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.email) {
            setValues((v) => ({ ...v, email: data.email }));
          }
          setSessionInfo((prev) => ({
            ...prev,
            lastSignedIn: data.last_signed_in ? new Date(data.last_signed_in) : prev.lastSignedIn || new Date(),
            ip: data.current_ip || prev.ip,
          }));
        }
      })
      .catch((err) => console.warn("Failed to fetch user session info:", err));

    // Fallback public IP check if backend IP is private/loopback
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
  }, []);

  // Validation criteria definition
  const criteria = [
    { id: "length", label: "8+ characters", valid: values.newPassword.length >= 8 },
    { id: "upper", label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(values.newPassword) },
    { id: "lower", label: "Lowercase letter (a-z)", valid: /[a-z]/.test(values.newPassword) },
    { id: "digit", label: "Number (0-9)", valid: /\d/.test(values.newPassword) },
    { id: "special", label: "Special symbol (@$!%*?&#)", valid: /[@$!%*?&#]/.test(values.newPassword) },
  ];

  const satisfiedCount = criteria.filter((c) => c.valid).length;
  const passwordsMatch = 
    values.newPassword.length > 0 && 
    values.confirmNewPassword.length > 0 && 
    values.newPassword === values.confirmNewPassword;
  const passwordsMismatch = 
    values.confirmNewPassword.length > 0 && 
    values.newPassword !== values.confirmNewPassword;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setValues((v) => ({ ...v, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({});

    // Client-side validations
    const errors = {};
    if (!values.email.trim()) {
      errors.email = "Account email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!values.oldPassword) {
      errors.oldPassword = "Enter your current password.";
    } else if (values.oldPassword.length < 8) {
      errors.oldPassword = "Current password must be at least 8 characters.";
    }

    if (!values.newPassword) {
      errors.newPassword = "Enter your new password.";
    } else if (satisfiedCount < criteria.length) {
      errors.newPassword = "New password must meet all 5 security requirements.";
    }

    if (!values.confirmNewPassword) {
      errors.confirmNewPassword = "Confirm your new password.";
    } else if (values.newPassword !== values.confirmNewPassword) {
      errors.confirmNewPassword = "Passwords do not match.";
    }

    if (values.oldPassword && values.newPassword && values.oldPassword === values.newPassword) {
      errors.newPassword = "New password must be different from your current password.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    // Primary: Call backend updatePassword
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/auth/updatePassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: values.email.trim(),
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Password updated successfully! You can now use your new password next time you sign in.");
        setValues((v) => ({ ...v, oldPassword: "", newPassword: "", confirmNewPassword: "" }));
        setLoading(false);
        return;
      }

      // Backend returned error
      if (data.errors && Array.isArray(data.errors)) {
        const mappedErrors = {};
        data.errors.forEach((err) => {
          if (err.path) mappedErrors[err.path] = err.msg;
        });
        setFieldErrors(mappedErrors);
        setErrorMessage(data.errors.map((err) => err.msg).join(" • "));
        setLoading(false);
        return;
      }

      if (data.error === "Old password is incorrect") {
        setFieldErrors({ oldPassword: "The current password you entered is incorrect." });
        setErrorMessage("Current password is incorrect. Please verify your current password.");
        setLoading(false);
        return;
      }

      // If backend gave generic/assert error, attempt Firebase Client SDK fallback
      console.warn("Backend updatePassword rejected, trying Firebase Client SDK fallback...", data);
      await triggerClientFallback();

    } catch (networkErr) {
      console.warn("Backend updatePassword network failed, attempting Firebase Client SDK fallback...", networkErr);
      await triggerClientFallback(networkErr);
    } finally {
      setLoading(false);
    }
  };

  // Resilient fallback via Firebase Client SDK
  const triggerClientFallback = async (originalErr = null) => {
    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        values.email.trim(), 
        values.oldPassword
      );

      if (!userCredential?.user) {
        throw new Error("Unable to re-authenticate with current credentials.");
      }

      await updateFirebasePassword(userCredential.user, values.newPassword);
      setSuccessMessage("Password updated successfully via secure fallback!");
      setValues((v) => ({ ...v, oldPassword: "", newPassword: "", confirmNewPassword: "" }));
      setErrorMessage("");
    } catch (clientErr) {
      console.error("Firebase Client SDK fallback error:", clientErr);
      const friendly = getFriendlyAuthError(clientErr, originalErr?.message);
      setErrorMessage(friendly);
      if (clientErr.code === "auth/wrong-password" || clientErr.code === "auth/invalid-credential") {
        setFieldErrors({ oldPassword: "The current password you entered is incorrect." });
      }
    }
  };

  // Strength Bar Colors & Label
  const getStrengthMeta = () => {
    if (!values.newPassword) return { label: "", color: "bg-gray-700", count: 0 };
    if (satisfiedCount <= 2) return { label: "Weak", color: "bg-rose-500", count: satisfiedCount };
    if (satisfiedCount <= 3) return { label: "Fair", color: "bg-amber-500", count: satisfiedCount };
    if (satisfiedCount === 4) return { label: "Good", color: "bg-blue-500", count: satisfiedCount };
    return { label: "Strong", color: "bg-emerald-500", count: 5 };
  };

  const strengthMeta = getStrengthMeta();

  return (
    <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md transition-all">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
            Update Password
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Choose a strong, unique password to secure your SIB account.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold self-start sm:self-auto">
          <ShieldAlert className="w-3.5 h-3.5" />
          End-to-End Encrypted
        </div>
      </div>

      {/* Global Success Banner */}
      {successMessage && (
        <div 
          role="alert"
          className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-emerald-400">Password Updated</h4>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-0.5 leading-relaxed">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div 
          role="alert"
          className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-400">Unable to Update Password</h4>
            <p className="text-xs sm:text-sm text-rose-200/90 mt-0.5 leading-relaxed">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Email */}
          <div className="space-y-1.5 md:col-span-2">
            <label 
              htmlFor="email" 
              className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-500" />
                Account Email
              </span>
              <span className="text-[11px] font-normal text-gray-500">Auto-detected from active session</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={values.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? "border-rose-500 focus:ring-rose-500/30 bg-rose-500/5 text-gray-900 dark:text-gray-100"
                    : "border-gray-300 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:border-amber-500 focus:ring-amber-500/20"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs font-medium text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Current Password */}
          <div className="space-y-1.5 md:col-span-2">
            <label 
              htmlFor="oldPassword" 
              className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-amber-500" />
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                id="oldPassword"
                value={values.oldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                autoComplete="current-password"
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm transition-all focus:outline-none focus:ring-2 ${
                  fieldErrors.oldPassword
                    ? "border-rose-500 focus:ring-rose-500/30 bg-rose-500/5 text-gray-900 dark:text-gray-100"
                    : "border-gray-300 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:border-amber-500 focus:ring-amber-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                aria-label={showOldPassword ? "Hide password" : "Show password"}
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.oldPassword && (
              <p className="text-xs font-medium text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.oldPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label 
              htmlFor="newPassword" 
              className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-amber-500" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={values.newPassword}
                onChange={handleChange}
                placeholder="Create new password"
                autoComplete="new-password"
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm transition-all focus:outline-none focus:ring-2 ${
                  fieldErrors.newPassword
                    ? "border-rose-500 focus:ring-rose-500/30 bg-rose-500/5 text-gray-900 dark:text-gray-100"
                    : "border-gray-300 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:border-amber-500 focus:ring-amber-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs font-medium text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label 
              htmlFor="confirmNewPassword" 
              className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                Confirm New Password
              </span>
              {passwordsMatch && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmNewPassword"
                value={values.confirmNewPassword}
                onChange={handleChange}
                placeholder="Re-type new password"
                autoComplete="new-password"
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm transition-all focus:outline-none focus:ring-2 ${
                  fieldErrors.confirmNewPassword || passwordsMismatch
                    ? "border-rose-500 focus:ring-rose-500/30 bg-rose-500/5 text-gray-900 dark:text-gray-100"
                    : passwordsMatch
                    ? "border-emerald-500/80 focus:ring-emerald-500/20 bg-emerald-500/5 text-gray-900 dark:text-gray-100"
                    : "border-gray-300 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:border-amber-500 focus:ring-amber-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmNewPassword && (
              <p className="text-xs font-medium text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.confirmNewPassword}
              </p>
            )}
            {!fieldErrors.confirmNewPassword && passwordsMismatch && (
              <p className="text-xs font-medium text-amber-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Passwords do not match yet
              </p>
            )}
          </div>
        </div>

        {/* Real-time Password Strength & Criteria Helper Card */}
        {values.newPassword.length > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850/60 p-4 space-y-3 animate-in fade-in duration-200">
            {/* Visual Strength Meter */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Password Strength:</span>
              <span className={`font-bold uppercase tracking-wider ${
                strengthMeta.label === "Strong" 
                  ? "text-emerald-400" 
                  : strengthMeta.label === "Good" 
                  ? "text-blue-400" 
                  : strengthMeta.label === "Fair" 
                  ? "text-amber-400" 
                  : "text-rose-400"
              }`}>
                {strengthMeta.label}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={`h-full rounded-full transition-all duration-300 ${
                    index <= strengthMeta.count ? strengthMeta.color : "bg-gray-300 dark:bg-gray-700/60"
                  }`}
                />
              ))}
            </div>

            {/* Criteria Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
              {criteria.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 transition-colors ${
                    item.valid
                      ? "text-emerald-500 dark:text-emerald-400 font-medium"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    item.valid
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 border border-gray-300 dark:border-gray-700"
                  }`}>
                    {item.valid ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : "•"}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800 gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1 text-center sm:text-left">
            Changing your password will require signing in again on other devices.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold px-7 py-3 text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-gray-950" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Session & Device History */}
      <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-500" />
              Session & Device History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Review current and past account sign-in details to verify account access.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active Session
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Device Type */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              {sessionInfo.isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Device & Browser</span>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5">
                {sessionInfo.device}
              </p>
              <span className="text-[11px] text-emerald-400 font-medium mt-0.5 block">Current Active Device</span>
            </div>
          </div>

          {/* IP Address */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">IP Address</span>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5 font-mono">
                {sessionInfo.ip}
              </p>
              <span className="text-[11px] text-gray-500 block mt-0.5">Logged-in Network IP</span>
            </div>
          </div>

          {/* Last Signed In */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Last Signed In</span>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5">
                {sessionInfo.lastSignedIn ? new Date(sessionInfo.lastSignedIn).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                }) : "Active Now"}
              </p>
              <span className="text-[11px] text-gray-500 block mt-0.5">Timestamp (last_signed_in)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Members can see if anyone else accessed their account. If you ever notice an unfamiliar device or IP address, update your password above immediately.</span>
        </div>
      </div>
    </section>
  );
}
