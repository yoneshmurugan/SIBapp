export default function Alert({ tone = 'error', message, id = 'form-alert' }) {
  const styles =
    tone === 'error'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700'
      : 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700';

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={`mb-4 rounded-md border px-3 py-2 text-sm transition-colors duration-200 ${styles}`}
    >
      {message}
    </div>
  );
}
