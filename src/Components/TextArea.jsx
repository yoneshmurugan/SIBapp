import { useId, useState, useEffect } from "react";

export default function TextArea({
  label = "Notes",
  value,
  onChange,
  placeholder = "Type here...",
  rows = 4,
  maxLength,
  helperText,
  disabled = false,
  required = false,
}) {
  const id = useId();
  const [internal, setInternal] = useState(value ?? "");

  useEffect(() => {
    if (typeof value === "string") setInternal(value);
  }, [value]);

  const current = typeof value === "string" ? value : internal;

  const setVal = (v) => {
    if (typeof value !== "string") setInternal(v);
    onChange?.(v);
  };

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200"
      >
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      <div className={`relative rounded-md ${disabled ? "opacity-60" : ""}`}>
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={current}
          onChange={(e) => setVal(e.target.value)}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          className={`
            block w-full resize-y rounded-md border bg-white text-gray-900
            border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400
            shadow-sm outline-none
            focus:border-amber-400 focus:ring-2 focus:ring-amber-500/50
            disabled:cursor-not-allowed
            dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400
            dark:focus:border-amber-400 dark:focus:ring-amber-500/40
          `}
        />

        {maxLength !== undefined && (
          <div className="pointer-events-none absolute bottom-1 right-2 text-xs text-gray-500 dark:text-gray-400">
            {current.length}/{maxLength}
          </div>
        )}
      </div>

      {helperText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
