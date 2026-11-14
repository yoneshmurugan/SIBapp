import { AlertCircle, AlertTriangle } from 'lucide-react';

export default function Alert({ tone = 'error', message, id = 'form-alert' }) {
  const styles =
    tone === 'error'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60'
      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60';

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={`mb-4 rounded-xl border p-3.5 text-xs sm:text-sm transition-colors duration-200 flex items-start gap-2.5 ${styles}`}
    >
      {tone === 'error' ? (
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
      ) : (
        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
      )}
      <span className="font-medium leading-relaxed">{message}</span>
    </div>
  );
}
