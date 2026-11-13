import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
        'block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-amber-400 dark:focus:border-amber-400 transition-all pr-10';
    const normal = 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800';
    const errored = 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800';
    const inputClass = `${base} ${error ? errored : normal}`;

    return (
        <div className="mb-2">
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200"
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {error && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
