import { AlertTriangle } from "lucide-react";

export default function ErrorComponent({ message = "Something went wrong!" }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90 z-50">
      <div className="flex flex-row items-center gap-3 bg-red-100 dark:bg-red-400 p-6 rounded-xl shadow-lg border-2 border-red-400">
        <AlertTriangle className="text-red-600 dark:text-red-800 w-8 h-8" />
        <span className="font-bold text-red-800 dark:text-red-900 text-lg">{message}</span>
      </div>
    </div>
  );
}
