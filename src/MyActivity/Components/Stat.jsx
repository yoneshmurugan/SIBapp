import clsx from "clsx";

function Stat({ name, value, classname }) {
  return (
    <div
      className={clsx(
        "flex flex-col justify-center items-center bg-stone-50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-gray-700/50 p-4 w-full min-h-[90px] sm:min-h-[110px] transition-colors duration-300",
        classname
      )}
    >
      <p className="text-2xl sm:text-3xl font-bold mb-1 text-amber-500 dark:text-amber-400 tabular-nums">{value}</p>
      <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 text-center uppercase tracking-widest leading-tight px-1">{name}</p>
    </div>
  );
}

export default Stat;
