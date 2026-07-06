import { HiExclamationCircle } from "react-icons/hi";
import { useRouteError } from "react-router-dom";

export default function ErrorDisplay({ message = "An unexpected error occurred."}) {
  const error = useRouteError();

  const onRetry = () => {
    window.location.reload();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] p-8 bg-gradient-to-br from-red-50 dark:from-gray-950/70 via-gray-100 dark:via-gray-900/80 to-white dark:to-gray-950">
      <div className="flex items-center justify-center bg-red-100 dark:bg-red-800 rounded-full p-6 mb-6 shadow">
        <HiExclamationCircle className="text-red-500 dark:text-red-300" size={56} />
      </div>
      <h2 className="text-2xl sm:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2 text-center">
        Error
      </h2>
      <p className="text-md sm:text-lg max-w-md text-center text-gray-700 dark:text-gray-200 mb-6">
        {error?.message || message || "An unexpected error occurred."}
      </p>
        <button
          onClick={onRetry}
          className="mt-2 px-6 py-2 rounded-lg bg-amber-300 dark:bg-amber-900 text-gray-900 dark:text-amber-100 font-medium border border-amber-300 dark:border-amber-600 hover:bg-amber-400 dark:hover:bg-amber-800 transition-colors"
        >
          Try Again
        </button>
    </div>
  );
}