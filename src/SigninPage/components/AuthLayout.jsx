export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-gray-200 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <section className="flex flex-col">{children}</section>
      </div>
    </main>
  );
}
