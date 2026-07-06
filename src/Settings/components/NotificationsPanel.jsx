const Row = ({ label, desc }) => (
  <div className="flex items-start justify-between rounded-lg border border-slate-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
    <div>
      <p className="text-sm font-medium text-slate-900 dark:text-gray-100">{label}</p>
      <p className="text-xs text-slate-500 dark:text-gray-400">{desc}</p>
    </div>
    <label className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 dark:border-gray-600 text-slate-900 dark:text-gray-100 focus:ring-slate-400 dark:focus:ring-gray-500"
        checked={true}
      />
      <span className="text-sm text-slate-700 dark:text-gray-300">Enable</span>
    </label>
  </div>
);

export default function NotificationsPanel() {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-gray-100">Notifications</h2>
      <div className="space-y-3">
        <Row label="Product updates" desc="Feature launches and improvements" />
        <Row label="Security alerts" desc="Password, login, and device changes" />
        <Row label="Marketing emails" desc="Tips, tutorials, and case studies" />
      </div>
    </section>
  );
}
