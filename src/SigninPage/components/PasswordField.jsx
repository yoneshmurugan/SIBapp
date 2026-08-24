import { useState } from 'react';

export default function PasswordField({
    id = 'password',
    label = 'Password',
    value,
    onChange,
    placeholder = '••••••••',
    error,
    autoComplete = 'current-password',
}) {
    const [show, setShow] = useState(false);
    const type = show ? 'text' : 'password';

    const base =
        'block w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-yellow-400 dark:focus:border-yellow-400';
    const normal = 'border-gray-300 dark:border-gray-600';
    const errored = 'border-red-500 focus:ring-red-500 focus:border-red-500';
    const inputClass = `${base} ${error ? errored : normal} dark:bg-gray-800`;

    return (
        <div className="mb-2">
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
                {label}
            </label>
            <div className="relative">
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
                    className={inputClass}
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? 'Hide' : 'Show'}
                </button>
            </div>
            {error && (
                <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
