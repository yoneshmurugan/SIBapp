export default function TextField({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    autoComplete,
}) {
    const base =
        'block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-amber-400 dark:focus:border-amber-400 transition-all';
    const normal = 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800';
    const errored = 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800';

    return (
        <div className="mb-4">
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200"
            >
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`${base} ${error ? errored : normal}`}
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
