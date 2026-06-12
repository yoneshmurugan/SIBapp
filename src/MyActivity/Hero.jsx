import { Download, CalendarDays, Filter } from "lucide-react";
import DateField from "./Components/DateField";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

async function exportActivity(jsonData, filename = "user_activities.csv") {
  if (!jsonData || !jsonData.length) {
    alert("No data to export");
    return;
  }
  const headers = Object.keys(jsonData[0]).filter(h => h !== "fullDetails");
  const csvRows = [headers.join(",")];
  jsonData.forEach(item => {
    const values = headers.map(header => {
      const value = item[header];
      const escaped = (value === undefined || value === null) ? "" : ("" + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  });
  const csvString = csvRows.join("\n");

  if (Capacitor.isNativePlatform()) {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: csvString,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });
      await Share.share({
        title: "SIB Activity Export",
        url: result.uri,
      });
      return;
    } catch (e) {
      console.error("[Export] Native export failed:", e);
      alert("Export failed: " + e.message);
    }
  } else {
    // On Web, try navigator.share with files
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([csvString], filename, { type: "text/csv" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "SIB Activity Export" });
          return;
        }
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    }

    // Desktop fallback: trigger download
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}


function Hero({ value, setValue = () => { }, startDate, endDate, setStartDate = () => { }, setEndDate = () => { } , userdata }) {

  const options = [
    { value: "all", label: "All" },
    { value: "tyftb", label: "TYB" },
    { value: "m2m", label: "M to M" },
    { value: "referral", label: "Referral" },
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-5 shadow-sm dark:shadow-none transition-colors duration-300">
      
      {/* Activity Type Segmented Control */}
      <div className="flex flex-col gap-2">
         <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Filter size={16} className="text-amber-500" />
            Activity Type
         </h2>
         <div className="w-full overflow-x-auto custom-scrollbar pb-1">
            <div className="flex gap-2 min-w-max">
               {options.map((opt) => (
                  <button
                     key={opt.value}
                     onClick={() => setValue(opt.value)}
                     className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        value === opt.value 
                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                     }`}
                  >
                     {opt.label}
                  </button>
               ))}
            </div>
         </div>
      </div>

      <div className="h-px w-full bg-stone-100 dark:bg-gray-800"></div>

      {/* Date Range & Download */}
      <div className="flex flex-col gap-2">
         <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
               <CalendarDays size={16} className="text-amber-500" />
               Date Range
            </h2>
            
            <button
               className="text-xs sm:text-sm bg-stone-50 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-lg py-1.5 px-3 font-semibold flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors duration-300 active:scale-95"
               onClick={() => exportActivity(userdata)}
               title="Export to CSV"
            >
               <Download size={14} />
               <span className="hidden sm:inline">Export</span>
            </button>
         </div>

         <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-1">
            <div className="w-full">
               <DateField value={startDate} handler={setStartDate} />
            </div>
            <div className="w-full">
               <DateField value={endDate} handler={setEndDate} />
            </div>
         </div>
      </div>
    </div>
  );
}

export default Hero;
