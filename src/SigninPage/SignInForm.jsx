import { useState, useEffect } from "react";
import TextField from "./components/TextField";
import PasswordField from "./components/PasswordField";
import Alert from "./components/Alert";
import { validateEmail, validatePassword } from "./utils/validators";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // <-- Import auth directly!
import { useNavigate } from "react-router-dom";

import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Preferences } from "@capacitor/preferences";

export default function SignInForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const result = await NativeBiometric.isAvailable();
        const { value: savedCreds } = await Preferences.get({ key: 'sib_credentials' });
        if (result.isAvailable && savedCreds) {
          setIsBiometricAvailable(true);
        }
      } catch (err) {
        console.log("Biometrics check failed.", err);
      }
    };
    checkBiometrics();
  }, []);

  const onChange = (e) => {
    const { id, value } = e.target;
    setValues((v) => ({ ...v, [id]: value }));
    setErrors((e) => ({ ...e, [id]: "" }));
  };

  const validate = () => {
    const emailErr = validateEmail(values.email);
    const passErr = validatePassword(values.password);
    setErrors({ email: emailErr, password: passErr });
    return !emailErr && !passErr;
  };

  const authenticateUser = async (email, password) => {
    setLoading(true);
    setGlobalError("");

    try {
      console.log("🟢 STEP 1: Sending credentials to Firebase...");
      
      // FIREBASE IS NOW FIXED AND WILL NOT CRASH HERE
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user_id = userCredential.user.uid;
      const idToken = await userCredential.user.getIdToken(true);

      console.log("🟢 STEP 2: Nuke old tokens...");
      await Preferences.remove({ key: 'sib_session_token' });

      console.log("🟢 STEP 3: Calling Backend /auth/sessionLogin...");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/sessionLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken, user_id }),
      });

      const data = await res.json();
      console.log("🟢 STEP 4: Backend replied with:", data);

      if (!res.ok) throw new Error(data.error || "Login failed on backend");

      if (data.sessionToken) {
        await Preferences.set({
          key: 'sib_session_token',
          value: data.sessionToken
        });
        console.log("🚨 TRAP 1 (SUCCESS): Token stored safely in Native Preferences!");
      }

      await Preferences.set({
        key: 'sib_credentials',
        value: JSON.stringify({ email, password })
      });

      if (user_id && data.isadmin === true) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("🔴 CRASH DETECTED:", err);
      setGlobalError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await authenticateUser(values.email, values.password);
  };

  const handleBiometricLogin = async () => {
    try {
      await NativeBiometric.verifyIdentity({
        reason: "Log in to your SIB account",
        title: "Log In",
      });

      const { value } = await Preferences.get({ key: 'sib_credentials' });
      if (value) {
        const { email, password } = JSON.parse(value);
        await authenticateUser(email, password);
      }
    } catch (error) {
      console.log("User canceled Face ID", error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-gray-900 dark:text-gray-100">
      {globalError && <Alert tone="error" message={globalError} id="form-alert" />}

      <TextField
        id="email"
        label="Email address"
        type="email"
        placeholder="name@example.com"
        value={values.email}
        onChange={onChange}
        error={errors.email}
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        inputMode="email"
        className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
      />

      <PasswordField
        id="password"
        label="Password"
        value={values.password}
        onChange={onChange}
        error={errors.password}
        autoComplete="current-password"
        className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
      />

      <div className="flex items-center justify-end w-full">
        <a href="/reset-password" className="text-sm text-red-600 hover:underline dark:text-red-400">
          Forgot password?
        </a>
      </div>

      <button type="submit" disabled={loading} className="mt-4 w-full rounded-md bg-yellow-500 px-4 py-2 text-gray-900 dark:text-gray-900 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60">
        {loading ? "Please wait…" : "Sign in"}
      </button>

      {isBiometricAvailable && (
        <button type="button" onClick={handleBiometricLogin} disabled={loading} className="mt-2 w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4M9 8h.01M15 8h.01M9 16c1.5-1.5 4.5-1.5 6 0"/>
          </svg>
          Sign in with Face ID
        </button>
      )}
    </form>
  );
}