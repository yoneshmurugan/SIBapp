export default function Loader({ text = "Loading..." }) {
  return (
    <div className="w-full h-48 flex flex-col items-center justify-center z-50 gap-4">
      <div className="flex space-x-2 justify-center items-center">
        <div className="h-4 w-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
        <div className="h-4 w-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }}></div>
        <div className="h-4 w-4 bg-amber-600 rounded-full animate-bounce"></div>
      </div>
      {text && (
         <span className="text-amber-600 dark:text-amber-500 font-semibold text-sm animate-pulse tracking-widest uppercase">
            {text}
         </span>
      )}
    </div>
  );
}