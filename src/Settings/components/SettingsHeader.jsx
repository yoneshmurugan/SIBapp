import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";

export default function SettingsHeader({ title = "Settings" }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 px-6 py-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
            {title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage your account security and preferences
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/80 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-amber-500" />
        <span>Dashboard</span>
      </button>
    </header>
  );
}
