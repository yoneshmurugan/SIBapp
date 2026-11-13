import { useState } from "react";
import TextField from "./components/TextField";
import PasswordField from "./components/PasswordField";
import Alert from "./components/Alert";
import { validateIdentifier, validatePassword } from "./utils/validators";
import { Loader2 } from "lucide-react";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function SignInForm() {
  const [values, setValues] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { id, value } = e.target;
    setValues((v) => ({ ...v, [id]: value }));
    setErrors((e) => ({ ...e, [id]: "" }));
  };

  const validate = () => {
    const idErr = validateIdentifier(values.identifier);
    const passErr = validatePassword(values.password);
    setErrors({ identifier: idErr, password: passErr });
    return !idErr && !passErr;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;

    try {
      setLoading(true);
      
      // 1. Lookup Email if it's a phone number
      let loginEmail = values.identifier.trim();
      if (!loginEmail.includes('@')) {
        const lookupRes = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/lookup-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: loginEmail }),
        });
        const lookupData = await lookupRes.json();
        if (!lookupRes.ok) {
          throw new Error(lookupData.error || "Could not find account for this phone number");
        }
        loginEmail = lookupData.email;
      }

      // 2. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, values.password);
      const user_id = userCredential.user.uid;
      const idToken = await userCredential.user.getIdToken(true);

      // 3. Establish Session
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/sessionLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken, user_id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      console.log("Login successful", data);
      if (user_id && data.isadmin === true) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      return;
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setGlobalError("Invalid email/phone number or password.");
      } else if (err.code === "auth/user-not-found") {
        setGlobalError("No account found with this email or phone number.");
      } else if (err.code === "auth/too-many-requests") {
        setGlobalError("Too many failed attempts. Please try again later or reset your password.");
      } else {
        setGlobalError(err.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 text-gray-900 dark:text-gray-100"
      role="form"
      aria-describedby={globalError ? "form-alert" : undefined}
      noValidate
    >
      {globalError && <Alert tone="error" message={globalError} id="form-alert" />}

      <TextField
        id="identifier"
        label="Email or Phone Number"
        type="text"
        placeholder="e.g. member@example.com or 9876543210"
        value={values.identifier}
        onChange={onChange}
        error={errors.identifier}
        autoComplete="username"
      />

      <PasswordField
        id="password"
        label="Password"
        value={values.password}
        onChange={onChange}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-end w-full pt-1">
        <button 
          type="button" 
          onClick={() => navigate('/reset-password')} 
          className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-950 font-bold py-2.5 px-4 text-sm transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
}
