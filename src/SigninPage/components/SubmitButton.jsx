import { NavLink } from "react-router-dom";

export default function SubmitButton({ text = 'Sign in', loading = false }) {
  return (
    <NavLink
      type="submit"
      to="/dashboard"
      className={`
        mt-4 inline-flex w-full items-center justify-center
        rounded-md bg-yellow-500 px-4 py-2 text-gray-900 font-medium
        hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400
        disabled:opacity-60 disabled:cursor-not-allowed
        dark:bg-yellow-400 dark:text-gray-900 dark:hover:bg-yellow-300
        transition-colors duration-200
      `}
      aria-busy={loading}
    >
      {loading ? 'Please wait…' : text}
    </NavLink>
  );
}
