import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../firebase';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RotateCw
} from 'lucide-react';

function getFriendlyErrorMessage(err, identifier) {
  if (!err) return "An unexpected error occurred. Please try again.";
  const code = err.code || "";
  const msg = err.message || "";

  if (code === "auth/user-not-found" || msg.includes("user-not-found")) {
    return `No registered account found for "${identifier}". Please verify your email or check with your chapter coordinator.`;
  }
  if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
    return "Too many requests. Please wait a few moments before trying again.";
  }
  if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
    return "Network connection issue. Please check your internet connection.";
  }
  if (msg.includes("INTERNAL ASSERT FAILED") || msg.includes("action link")) {
    return `Unable to create reset link for "${identifier}". Please verify that this email is registered in your chapter account.`;
  }
  return msg || "Failed to send reset link. Please try again.";
}

export default function ResetPassword() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleReset(e) {
    if (e) e.preventDefault();
    setError('');

    const input = identifier.trim();
    if (!input) {
      setError('Please enter your email address or phone number.');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify that the account exists in MongoDB (validates both email and phone number)
      const lookupRes = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/lookup-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: input }),
      });
      const lookupData = await lookupRes.json();
      if (!lookupRes.ok || !lookupData.email) {
        throw new Error(lookupData.error || `No registered account found for "${input}". Please verify your email or check with your chapter coordinator.`);
      }

      const targetEmail = lookupData.email.trim();
      setSentEmail(targetEmail);

      // 2. Attempt via backend endpoint
      let sentSuccess = false;
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/resetPassword`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: targetEmail })
        });
        const data = await res.json();
        if (res.ok && data.message === 'Password reset email sent successfully') {
          sentSuccess = true;
        } else if (res.status === 404 || data.error?.includes("No registered account") || data.error?.includes("user-not-found")) {
          // Explicit user not found error - DO NOT fallback
          throw new Error(data.error);
        } else {
          console.warn('Backend resetPassword returned error, falling back to Firebase Client SDK:', data);
        }
      } catch (backendErr) {
        if (backendErr.message?.includes("No registered account") || backendErr.message?.includes("user-not-found")) {
          throw backendErr;
        }
        console.warn('Backend resetPassword request failed, falling back to Firebase Client SDK:', backendErr);
      }

      // 3. Fallback to Firebase Client SDK directly (only for verified users when Admin action link fails)
      if (!sentSuccess) {
        const auth = getAuth(app);
        await sendPasswordResetEmail(auth, targetEmail);
        sentSuccess = true;
      }

      setSuccess(true);
      setCooldown(30);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(getFriendlyErrorMessage(err, input));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-8 sm:py-12 transition-colors duration-300">
      <div className="w-full max-w-md">
        
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center mb-4 shadow-sm">
              <img
                src="/assets/logo.webp"
                alt="SIB Logo"
                className="w-10 h-10 object-contain rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Enter your registered email address or phone number to receive a secure recovery link.
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  Reset Link Dispatched!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  We've sent a password reset email to:
                </p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1 break-all select-all font-mono">
                  {sentEmail}
                </p>
                <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-gray-500 dark:text-gray-400">
                  Please check your inbox (and Spam/Junk folder). Click the link in that email to set a new password.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleReset()}
                  disabled={loading || cooldown > 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                  <RotateCw size={15} className={loading ? "animate-spin" : ""} />
                  <span>
                    {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Reset Email'}
                  </span>
                </button>

                <Link
                  to="/signin"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-950 text-sm font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleReset} noValidate className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm animate-in fade-in duration-200">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <p className="flex-1 font-medium">{error}</p>
                </div>
              )}

              <div>
                <label 
                  htmlFor="identifier" 
                  className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5"
                >
                  Registered Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    required
                    autoFocus
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. member@example.com or 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                    disabled={loading}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  If you enter a registered 10-digit mobile number, we'll automatically resolve your associated email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-950 font-bold py-2.5 px-4 text-sm transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
