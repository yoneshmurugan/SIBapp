import React, { useState } from "react";
import classnames from '../../utils/classname';

export default function SecurityPanel() {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ email: "", oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [response, setResponse] = useState("");

  const handler = (e) => {
    const { id, value } = e.target;
    setValues((v) => ({ ...v, [id]: value }));
  };

  const submitForm = async () => {
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/auth/updatePassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        }
      );
      const data = await res.json();
      if (data.errors && Array.isArray(data.errors)) {
        setResponse(data.errors.map(e => e.msg).join(", "));
      } else {
        setResponse(data.message || data.error || "Unknown error occurred. Try updating secure password.");
      }
    } catch (error) {
      setResponse(`Network or server error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-gray-100">
        Security
      </h2>
      {response && (
        <p className="rounded-md border px-3 py-2 text-sm bg-yellow-50 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-600 mb-3">
          {response}
        </p>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { label: "Email", id: "email", type: "email" },
            { label: "Current password", id: "oldPassword", type: "password" },
            { label: "New password", id: "newPassword", type: "password" },
            { label: "Confirm new password", id: "confirmNewPassword", type: "password" },
          ].map((field) => (
            <div className="space-y-1" key={field.id}>
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{field.label}</label>
              <input
                type={field.type}
                id={field.id}
                onChange={handler}
                className="w-full rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-gray-500"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={loading}
          className={classnames(
            "rounded-md bg-red-500 dark:bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500/80 dark:hover:bg-red-500/90 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-gray-500",
            loading && "cursor-no-drop bg-red-500/100 dark:bg-red-600/100"
          )}
          onClick={submitForm}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </section>
  );
}
