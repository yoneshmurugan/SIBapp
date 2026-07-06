import { NavLink } from "react-router-dom";

export default function NotFound404() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-6">
      <div className="relative max-w-xl text-center">
        <div className="relative inline-block">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 rounded-2xl bg-amber-400/20 blur-md"
          />
          <h1 className="text-[6rem] leading-none font-extrabold tracking-tight select-none text-gray-100">
            4<span className="text-amber-400">0</span>4
          </h1>

          <span className="absolute -right-3 top-3 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        </div>

        <p className="mt-4 text-lg text-gray-400">
          The page could not be found or may have been moved.
        </p>
        <div className="mx-auto my-6 h-px w-20 bg-gray-700" />

        <div className="mt-2 flex items-center justify-center gap-3">
          <NavLink
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-gray-900 shadow-sm ring-1 ring-amber-400/40 transition hover:-translate-y-0.5 hover:bg-amber-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Go home
          </NavLink>
        </div>

        <div className="pointer-events-none relative mt-10 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce mx-2" />
          <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse mx-2" />
          <div className="h-2 w-2 rounded-full bg-red-500 animate-bounce mx-2 [animation-delay:200ms]" />
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Error code: 404 — Try checking the URL or return to the homepage.
        </p>
      </div>
    </main>
  );
}
