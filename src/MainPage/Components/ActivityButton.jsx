import clsx from "clsx";

function ActivityButton({
  content = "hi",
  onClick,
  active = false,
  fontSize = "text-[12px]",
  className,
  textColor = "text-red-500/80",
  borderColor = "border-red-500/50",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "font-semibold py-2 px-4 rounded-2xl border-2 transition-colors duration-200",
        !active && textColor,
        !active && borderColor,
        active && "text-white border-red-600 bg-red-500",
        active ? "hover:bg-red-600 focus:ring-2 focus:ring-red-300"
               : "hover:bg-red-50 dark:hover:bg-red-500/10 focus:ring-2 focus:ring-red-200",
        "focus:outline-none",
        className
      )}
    >
      <p className={clsx("text-nowrap", fontSize)}>{content}</p>
    </button>
  );
}

export default ActivityButton;
