import { useId, useState, useEffect } from "react";

export default function SelectButtons({
  label = "Referral Status",
  items = [
    { name: "Given your card", value: "given-card" },
    { name: "Told them you would call", value: "told-call" },
  ],
  value,
  onChange,
}) {
  const groupId = useId();
  const [internal, setInternal] = useState(value ?? []);
  useEffect(() => {
    if (Array.isArray(value)) setInternal(value);
  }, [value]);

  const selected = Array.isArray(value) ? value : internal;

  const toggle = (val) => {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    if (!Array.isArray(value)) setInternal(next);
    onChange?.(next);
  };

  return (
    <fieldset className="w-full">
      <legend className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </legend>
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => {
          const isChecked = selected.includes(item.value);
          return (
            <label
              key={item.value ?? idx}
              htmlFor={`${groupId}-${item.value}`}
              className="relative flex items-center gap-2 cursor-pointer select-none text-gray-900 dark:text-gray-100"
            >
              <input
                id={`${groupId}-${item.value}`}
                type="checkbox"
                className="peer sr-only"
                checked={isChecked}
                onChange={() => toggle(item.value)}
              />
              <span
                aria-hidden="true"
                className={[
                  "grid size-4 place-items-center rounded-sm border transition-colors",
                  isChecked
                    ? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400"
                    : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
                  "outline-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500 dark:peer-focus-visible:outline-blue-400",
                ].join(" ")}
              >
                <svg
                  viewBox="0 0 20 20"
                  className={[
                    "h-3 w-3 text-white transition-opacity",
                    isChecked ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <path
                    d="M6 10l2.5 2.5L14 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span className="text-sm">{item.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
