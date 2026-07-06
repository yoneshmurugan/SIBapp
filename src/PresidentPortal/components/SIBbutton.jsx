import React from "react"

const SIBbutton = ({
  onClick,
  content = "View Calendar",
  disabled = false,
  variant = "primary",
  loading = false,
  className = "",
  type = "button",
}) => {
  const baseStyles = "px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"

  const variants = {
    primary: `
      bg-yellow-400 text-black
      hover:bg-yellow-500 
      focus:ring-4 focus:ring-yellow-300
      dark:bg-yellow-500 dark:text-gray-900 
      dark:hover:bg-yellow-400 
      dark:focus:ring-yellow-600
      shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-gray-100 dark:bg-gray-900 
      text-gray-900 dark:text-gray-100
      border border-gray-300 dark:border-gray-700
      hover:bg-gray-200 dark:hover:bg-gray-800
      focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700
    `,
    disabled: `
      bg-gray-100 dark:bg-gray-900 
      text-gray-500 dark:text-gray-600
      border border-gray-300 dark:border-gray-700
      cursor-not-allowed opacity-50
    `
  }

  const isDisabled = disabled || loading
  const selectedVariant = disabled ? 'disabled' : variant

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[selectedVariant]}
        ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
      aria-busy={loading}
      aria-disabled={isDisabled}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {content}
    </button>
  )
}

export default SIBbutton