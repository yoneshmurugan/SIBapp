import { BarChart3 } from "lucide-react";
import Stat from "./Components/Stat";

function Stats({
  header = "Activity Details",
  items = [
    { name: "Referrals Given", value: 0 },
    { name: "Referrals Received", value: 0 },
    { name: "TYB Given", value: 0 },
    { name: "TYB Received", value: 0 },
    { name: "M2M Attended", value: 0 },
  ],
}) {
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-stone-100 dark:border-gray-800 p-4 sm:p-6 shadow-sm dark:shadow-none transition-colors duration-300">
      <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
         <BarChart3 size={16} className="text-amber-500" />
         {header}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map((element, index) => (
          <Stat name={element.name} value={element.value} key={index} />
        ))}
      </div>
    </div>
  );
}

export default Stats;
