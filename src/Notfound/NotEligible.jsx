import { HiBan } from "react-icons/hi";

export default function NotEligibleRole() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] p-8 bg-gradient-to-b from-gray-50 dark:from-gray-900 via-amber-100 dark:via-amber-900/20 to-white dark:to-gray-950">
      <div className="flex items-center justify-center bg-amber-300 dark:bg-amber-900 rounded-full p-6 mb-6 shadow-md">
        <HiBan className="text-red-600 dark:text-red-400" size={48} />
      </div>
      <h2 className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-100 font-bold mb-2 text-center">
        Access Denied
      </h2>
      <p className="text-md sm:text-lg max-w-md text-center text-gray-700 dark:text-gray-200 mb-6">
        Your role does not have the necessary permissions to view this page.
      </p>
      <div className="px-6 py-3 rounded-lg bg-amber-300/60 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-600 text-gray-900 dark:text-amber-100 font-medium">
        Please contact your chapter administrator or try a different route.
      </div>
    </div>
  );
}