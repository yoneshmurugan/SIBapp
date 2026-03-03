import { useState, useEffect } from "react";
import TextField from "./components/TextField";
import PasswordField from "./components/PasswordField";
import Alert from "./components/Alert";
import { validateEmail, validatePassword } from "./utils/validators";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";

// 1. Import Capacitor Plugins
import { CapacitorHttp } from '@capacitor/core';
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Preferences } from "@capacitor/preferences";

export default function SignInForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const auth = getAuth(app);
  const navigate = useNavigate();

  // 2. Check if FaceID/TouchID is available on this iPhone when the component loads
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const result = await NativeBiometric.isAvailable();
        // Only show the Face ID button if the device supports it AND they have saved credentials
        const { value: savedCreds } = await Preferences.get({ key: 'sib_credentials' });
        if (result.isAvailable && savedCreds) {
          setIsBiometricAvailable(true);
        }
      } catch (err) {
        console.log("Biometrics check failed or not supported on this device.", err);
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

  // 3. The main authentication logic (used by both manual login and biometric login)
  const authenticateUser = async (email, password) => {
    setLoading(true);
    setGlobalError("");

    try {
      // Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user_id = userCredential.user.uid;
      const idToken = await userCredential.user.getIdToken(true);

      // Capacitor Native HTTP Request (Bypasses Safari Cookie Blocking)
      const options = {
        url: `${import.meta.env.VITE_BACKEND_SERVER}/auth/sessionLogin`,
        headers: { "Content-Type": "application/json" },
        // CapacitorHttp expects a JSON object for data, not a string
        data: { idToken, user_id }, 
      };

      const res = await CapacitorHttp.post(options);

      // CapacitorHttp returns an object with 'status' and 'data', not a fetch Response
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(res.data?.error || "Login failed on backend");
      }

      console.log("Login successful", res.data);

      // Save credentials securely so Face ID can use them next time!
      await Preferences.set({
        key: 'sib_credentials',
        value: JSON.stringify({ email, password })
      });

      if (user_id && res.data.isadmin === true) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
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

  // 4. Biometric Login Handler
  const handleBiometricLogin = async () => {
    try {
      await NativeBiometric.verifyIdentity({
        reason: "Log in to your SIB account",
        title: "Log In",
      });

      // If Face ID succeeds, grab the saved credentials and log them in
      const { value } = await Preferences.get({ key: 'sib_credentials' });
      if (value) {
        const { email, password } = JSON.parse(value);
        await authenticateUser(email, password);
      }
    } catch (error) {
      console.log("User canceled Face ID or it failed", error);
      // Fails silently so they can just type their password normally
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 text-gray-900 dark:text-gray-100"
      role="form"
      aria-describedby={globalError ? "form-alert" : undefined}
    >
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

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-md bg-yellow-500 px-4 py-2 text-gray-900 dark:text-gray-900 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
      >
        {loading ? "Please wait…" : "Sign in"}
      </button>

      {/* 5. Biometric Button - Only shows if FaceID is available and credentials are saved */}
      {isBiometricAvailable && (
        <button
          type="button"
          onClick={handleBiometricLogin}
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4M9 8h.01M15 8h.01M9 16c1.5-1.5 4.5-1.5 6 0"/>
          </svg>
          Sign in with Face ID
        </button>
      )}

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
      </div>
    </form>
  );
}