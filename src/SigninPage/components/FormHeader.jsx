export default function FormHeader({ 
  title = "Member Sign In", 
  subtitle = "Welcome back! Enter your details to continue" 
}) {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      {/* SIB Logo */}
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-center mb-3 shadow-sm">
        <img
          src="/assets/logo.webp"
          alt="SIB Logo"
          className="w-12 h-12 object-contain rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* SIB Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
        <span>SENGUNTHAR IN BUSINESS</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        {title}
      </h1>
      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}
