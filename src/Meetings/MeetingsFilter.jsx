import { useState, useEffect } from "react";
import Filter from '../Members/Components/Filter';
import FilterButton from "../Members/Components/FilterButton";

function MeetingsFilter({
  daterange = ["Life Time", "Last Month", "Last 90 Days"],
  meetingtype = ["All Types", "weekly", "monthly", "others"],
  status = ["All Status", "present", "absent"],
  onChange,
}) {
  const defaultState = {
    daterange: daterange[0],
    meetingtype: meetingtype[0],
    status: status[0],
  };

  const [state, setState] = useState(defaultState);

  useEffect(() => {
    onChange?.(state);
  }, [state, onChange]);

  const update = patch => {
    setState(prev => ({ ...prev, ...patch }));
  };

  const handleClear = () => {
    setState(defaultState);
  };

  return (
    <section
      className="
        w-full
        rounded-3xl
        bg-white/90 dark:bg-gray-900/60
        backdrop-blur-xl
        p-4 md:p-6
        shadow-xl shadow-gray-200/50 dark:shadow-black/20
        border border-gray-100 dark:border-gray-800
        transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60 dark:hover:shadow-black/30
      "
      aria-label="Directory filters"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Filter name="Date Range" state={state.daterange} update={update} content={daterange} />
        <Filter name="Meeting Type" state={state.meetingtype} update={update} content={meetingtype} />
        <Filter name="Status" state={state.status} update={update} content={status} />
        <div className="flex items-end">
          <FilterButton
            content="Clear Filter"
            onClick={handleClear}
            bg="bg-gray-300 dark:bg-gray-600"
            hover="hover:bg-gray-200 dark:hover:bg-gray-500"
          />
        </div>
      </div>
    </section>
  );
}

export default MeetingsFilter;
