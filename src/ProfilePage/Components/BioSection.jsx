import { useEffect, useState } from "react";

const BioSection = ({ title, content, editable, onChange, defaultOpen = false  , description = "hi bro"}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const panelId = `${title.replace(/\s+/g, "-").toLowerCase()}-panel`;
  const btnId = `${title.replace(/\s+/g, "-").toLowerCase()}-button`;

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalContent(val);
    onChange && onChange(val);
  };

  return (
    <div className="bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 mb-3 last:mb-0">
      <button
        id={btnId}
        type="button"
        className="flex w-full items-center justify-between p-4 text-left focus:outline-none active:bg-gray-100 dark:active:bg-gray-800/50 transition-colors"
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex flex-col gap-1 pr-4">
          <h3 className="text-[14px] font-black text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 line-clamp-1">
            {description}
          </span>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 shadow-sm'}`}>
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.25 8.27a.75.75 0 0 1-.02-1.06z" />
          </svg>
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0">
          <div className="px-4 pb-4">
            {editable ? (
              <textarea
                value={localContent}
                onChange={handleChange}
                className="w-full rounded-xl bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-900/50 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-[13px] font-medium transition-shadow"
                rows={5}
                placeholder={`Enter your ${title}...`}
              />
            ) : (
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100/50 dark:border-gray-700/50 shadow-inner">
                <p className="text-[13px] font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                  {localContent || "No details provided yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioSection;
