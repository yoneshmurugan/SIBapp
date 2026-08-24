import { Github, Globe } from "lucide-react";

export default function SocialButton({ provider = 'Google', onClick }) {
  const Icon = provider === "Google" ? Globe : Github;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex w-full items-center justify-center gap-2
        rounded-md border border-gray-300 bg-white
        px-4 py-2 text-gray-900
        hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-yellow-400
        dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700
        transition-colors duration-200
      "
      aria-label={`Continue with ${provider}`}
    >
      <Icon className="w-5 h-5" />
      <span>Continue with {provider}</span>
    </button>
  );
}
