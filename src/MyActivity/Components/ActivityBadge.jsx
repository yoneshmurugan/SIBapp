import clsx from "clsx";

const fontMap = {
  thin: "font-thin",
  extralight: "font-extralight",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

const cursorMap = {
  auto: "cursor-auto",
  default: "cursor-default",
  pointer: "cursor-pointer",
  wait: "cursor-wait",
  text: "cursor-text",
  move: "cursor-move",
  help: "cursor-help",
  "not-allowed": "cursor-not-allowed",
  none: "cursor-none",
  "context-menu": "cursor-context-menu",
  progress: "cursor-progress",
  crosshair: "cursor-crosshair",
  grab: "cursor-grab",
  grabbing: "cursor-grabbing",
  "no-drop": "cursor-no-drop",
};

const borderWidthMap = { 0: "border-0", 2: "border-2", 4: "border-4" };

const colorText800 = {
  red: "text-red-800 dark:text-red-400",
  orange: "text-orange-800 dark:text-orange-400",
  amber: "text-amber-800 dark:text-amber-400",
  yellow: "text-yellow-800 dark:text-yellow-400",
  lime: "text-lime-800 dark:text-lime-400",
  green: "text-green-800 dark:text-green-400",
  emerald: "text-emerald-800 dark:text-emerald-400",
  teal: "text-teal-800 dark:text-teal-400",
  cyan: "text-cyan-800 dark:text-cyan-400",
  sky: "text-sky-800 dark:text-sky-400",
  blue: "text-blue-800 dark:text-blue-400",
  indigo: "text-indigo-800 dark:text-indigo-400",
  violet: "text-violet-800 dark:text-violet-400",
  purple: "text-purple-800 dark:text-purple-400",
  fuchsia: "text-fuchsia-800 dark:text-fuchsia-400",
  pink: "text-pink-800 dark:text-pink-400",
  rose: "text-rose-800 dark:text-rose-400",
  gray: "text-gray-800 dark:text-gray-400",
};

const colorBg300Half = {
  red: "bg-red-300/50 dark:bg-red-700/30",
  orange: "bg-orange-300/50 dark:bg-orange-700/30",
  amber: "bg-amber-300/50 dark:bg-amber-700/30",
  yellow: "bg-yellow-300/50 dark:bg-yellow-700/30",
  lime: "bg-lime-300/50 dark:bg-lime-700/30",
  green: "bg-green-300/50 dark:bg-green-700/30",
  emerald: "bg-emerald-300/50 dark:bg-emerald-700/30",
  teal: "bg-teal-300/50 dark:bg-teal-700/30",
  cyan: "bg-cyan-300/50 dark:bg-cyan-700/30",
  sky: "bg-sky-300/50 dark:bg-sky-700/30",
  blue: "bg-blue-300/50 dark:bg-blue-700/30",
  indigo: "bg-indigo-300/50 dark:bg-indigo-700/30",
  violet: "bg-violet-300/50 dark:bg-violet-700/30",
  purple: "bg-purple-300/50 dark:bg-purple-700/30",
  fuchsia: "bg-fuchsia-300/50 dark:bg-fuchsia-700/30",
  pink: "bg-pink-300/50 dark:bg-pink-700/30",
  rose: "bg-rose-300/50 dark:bg-rose-700/30",
  gray: "bg-gray-300/50 dark:bg-gray-700/30",
};

function ActivityBadge({
  content,
  border = 0,
  font = "semibold",
  cursor = "no-drop",
  className,
}) {

  const contentType = {
    M2M: ["pink", "pink"],
    TYB: ["green", "green"],
    REFERRAL: ["orange", "orange"],
    Approved : ["green", "green"],
    Confirmed : ["blue", "blue"],
    Pending : ["amber", "amber"],
    Completed : ["blue" , "blue"],
    Present : ["green", "green"],
    Absent : ["red", "red"]
  }
  const colors = contentType[content] || ["gray", "gray"];
  return (
    <button
      className={clsx(
        "px-2.5 py-1 text-[10px] sm:text-[11px] rounded-full transition-colors duration-300",
        colorText800[colors[1]],
        colorBg300Half[colors[0]],
        fontMap[font],
        cursorMap[cursor],
        borderWidthMap[border],
        className
      )}
    >
      {content}
    </button>
  );
}

export default ActivityBadge;
