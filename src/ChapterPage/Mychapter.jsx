import Header from "../MainPage/Header";
import Stats from "../MyActivity/Stats";
import Filter from "../Members/Components/Filter";
import ChapterStats from "./components/ChapterStat";
import { useState } from "react";
import Search from "./components/Search";
import MemberBar from "./components/MemberBar";

function Meetings() {
  const dropdown = ["Company 1", "Company 2", "Extra"];

  const [state, setState] = useState({ dropdown: dropdown[0] });

  const update = (patch) => {
    const next = { ...state, ...patch };
    setState(next);
  };

  const item = [
    { name: "Meetings Held", value: 10 },
    { name: "Visitors", value: 5 },
    { name: "Guests", value: 12 },
    { name: "TYB Amount", value: "23Cr" },
    { name: "One-To-OneS", value: 4 },
  ];

  const content = {
    direction: "Given",
    name: "Yonesh Murugan",
    category: "Category Name",
    date: "20 Sept 2025",
    Given: 201,
    received: 123,
    business: "25L",
  };

  const MeetingComponents = Array.from({ length: 19 }, (_, i) => (
    <MemberBar key={i} content={content} />
  ));

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="fixed top-[10px] mx-0 left-0 w-full z-10 bg-transparent">
        <Header />
      </div>

      <div className="mt-[80px] w-full max-w-7xl px-3 sm:px-6 md:px-10">
        <h1 className="m-3 pb-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Chapter Details
        </h1>

        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Chapter Name
            </p>
            <div className="w-full sm:w-[220px]">
              <Filter
                content={dropdown}
                name={"Select Company"}
                state={state.dropdown}
                update={update}
              />
            </div>
          </div>
          <div className="px-2 sm:px-4 pb-3">
            <ChapterStats />
          </div>
        </div>

        <div className="w-full mb-6">
          <Stats
            header="Current Month KPIs (September 2025)"
            items={item}
          />
        </div>

        <div className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-2 sm:p-4">
          <div className="flex flex-row justify-between items-center mb-3">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white w-full sm:w-auto">
              Member Roster
            </p>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              <Search />
            </div>
          </div>

          <div className="overflow-y-auto h-[400px] sm:h-[500px] rounded-xl">
            <MemberBar header={true} />
            {MeetingComponents}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Meetings;
