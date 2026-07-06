import { useState, useEffect, useMemo } from "react";
import Header from "../MainPage/Header";
import MeetingsFilter from "./MeetingsFilter";
import Stats from "../MyActivity/Stats";
import Meeting from './Component/Meeting'


function Meetings() {
  const [filterState, setFilterState] = useState(null);
  const [rawMeetings, setRawMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let running = true;
    async function fetchMeetings() {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/meeting/attendance/getattendanceofmine`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch meetings");
        const data = await res.json();
        if (running) setRawMeetings(Array.isArray(data) ? data : []);
      } catch (e) {
        if (running) setRawMeetings([]);
      } finally {
        if (running) setLoading(false);
      }
    }
    fetchMeetings();
    return () => { running = false; };
  }, []);

  const mappedData = useMemo(
    () =>
      rawMeetings
        .filter(Boolean)
        .map(r => ({
          id: r._id ?? "",
          date: r.meeting?.meeting_date
            ? new Date(r.meeting.meeting_date).toISOString().slice(0, 10)
            : "",
          meetingDate: r.meeting?.meeting_date
            ? new Date(r.meeting.meeting_date).toLocaleDateString()
            : "",
          title: r.meeting?.title ?? "",
          location: r.meeting?.location ?? "",
          meetingType: r.meeting?.meeting_type
            ? r.meeting.meeting_type.charAt(0).toUpperCase() + r.meeting.meeting_type.slice(1)
            : "",
          duration: r.meeting?.duration ?? "",
          status: r.attendance_status ?? "",
          attendanceStatus:
            r.attendance_status === "present" ? "Present" : "Absent",
        })),
    [rawMeetings]
  );


  const filteredMeetings = useMemo(() => {

    if (!filterState) return mappedData;
    let filtered = mappedData;
    if (filterState.daterange) {
      const now = new Date();
      if (filterState.daterange === "Last Month") {
        const cutoff = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        filtered = filtered.filter(m => {
          const d = new Date(m.date);
          return d >= cutoff;
        });
      } else if (filterState.daterange === "Last 90 Days") {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 90);
        filtered = filtered.filter(m => {
          const d = new Date(m.date);
          return d >= cutoff;
        });
      }
    }
    if (
      filterState.meetingtype &&
      filterState.meetingtype !== "All Types"
    ) {
      filtered = filtered.filter(
        m =>
          m.meetingType &&
          m.meetingType.toLowerCase() === filterState.meetingtype.toLowerCase()
      );
    }
    if (filterState.status && filterState.status !== "All Status") {
      if (filterState.status === "present")
        filtered = filtered.filter(m => m.status === "present");
      else if (filterState.status === "absent")
        filtered = filtered.filter(m => m.status === "absent");
    }
    return filtered;
  }, [mappedData, filterState]);

  const stats = useMemo(() => {
    const totalMeetings = mappedData.length;
    const guests = 0;
    const attendanceCount = mappedData.filter(m => m.status === "present").length;
    const streak = (() => {
      let streak = 0, maxStreak = 0, prevPresent = false;
      mappedData
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(m => {
          if (m.status === "present") {
            streak = prevPresent ? streak + 1 : 1;
            maxStreak = Math.max(maxStreak, streak);
            prevPresent = true;
          } else {
            prevPresent = false;
          }
        });
      return maxStreak;
    })();
    return [
      { name: "Total Meetings", value: totalMeetings },
      { name: "Guests Brought", value: guests },
      {
        name: "Attendance Rate",
        value: totalMeetings
          ? `${Math.round((attendanceCount / totalMeetings) * 100)}%`
          : "0%",
      },
      { name: "Attendance Streak", value: streak },
    ];
  }, [mappedData]);

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen transition-colors duration-300">
      <div className="fixed top-[10px] left-0 w-full z-10 bg-transparent">
        <Header />
      </div>
      <main className="pt-[calc(120px+env(safe-area-inset-top,0px))] w-full max-w-7xl px-3 sm:px-6 md:px-10">
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
              My Meetings
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-[52px]">Track your attendance and meeting history</p>
        </div>
        <section className="w-full mb-6">
          <MeetingsFilter onChange={setFilterState} />
        </section>
        <section className="mb-6">
          <Stats header="Meeting Stats" items={stats} />
        </section>
        <section className="w-full mb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your meetings...</p>
            </div>
          ) : filteredMeetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMeetings.map(content => (
                <Meeting key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">No Meetings Found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Meetings;
