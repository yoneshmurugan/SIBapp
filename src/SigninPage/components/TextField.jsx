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
        'block w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-yellow-400 dark:focus:border-yellow-400';
    const normal = 'border-gray-300 dark:border-gray-600';
    const errored =
        'border-red-500 focus:ring-red-500 focus:border-red-500';

    return (
        <div className="mb-4">
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-100"
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
                className={`${base} ${error ? errored : normal} dark:bg-gray-800`}
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
