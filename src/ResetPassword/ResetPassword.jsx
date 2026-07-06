import React, { useState } from 'react';
import classNames from '../utils/classname';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const Url = `${import.meta.env.VITE_BACKEND_SERVER}/auth/resetPassword`;
  const Options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email })
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(Url, Options);
      const data = await response.json();

      if (data.message === "Password reset email sent successfully") {
        setMessage("Password reset link has been generated and sent successfully.");
      } else {
        console.log(data.error);
        setMessage("Unknown error occurred");
      }
    } catch (error) {
      setMessage(`Error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Reset Password
        </h2>
        {message && (
          <h2 className="text-blue-700 dark:text-blue-200 mb-4 p-2 text-center border-2 border-blue-800 dark:border-blue-300 rounded bg-blue-200/75 dark:bg-blue-900/50">
            {message}
          </h2>
        )}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
            Enter your email address
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:bg-gray-700 dark:text-gray-100 mb-6"
          />
          <button
            type="submit"
            disabled={loading}
            className={classNames(
              "w-full bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-white dark:text-gray-900 font-semibold py-2 rounded-md transition-colors duration-200",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
