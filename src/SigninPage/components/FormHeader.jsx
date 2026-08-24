export default function FormHeader({ title, subtitle }) {
  return (
    <header className="mb-6 text-center sm:text-left">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      <p className="mt-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {subtitle}
      </p>
    </header>
  );
}
