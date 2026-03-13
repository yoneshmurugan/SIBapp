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
    <div className="flex flex-col items-center justify-start w-full min-h-screen transition-colors duration-300 pb-[calc(env(safe-area-inset-bottom)_+_1rem)]">
      
      {/* Set to top-0 since Header.jsx now handles the notch padding internally */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Added the dynamic calc() to push the main content down below the notch + header height */}
      <main className="mt-[calc(env(safe-area-inset-top)_+_90px)] w-full max-w-7xl px-3 sm:px-6 md:px-10">
        <h1 className="pb-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Meetings
        </h1>
        <section className="w-full mb-6">
          <MeetingsFilter onChange={setFilterState} />
        </section>
        <section className="mb-6">
          <Stats header="Meeting Stats" items={stats} />
        </section>
        <section className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-2xl shadow-sm transition-colors duration-300">
          <div className="ml-3 overflow-y-auto h-[400px] sm:h-[400px] rounded-2xl">
            <Meeting header />
            {loading ? (
              <div className="flex justify-center items-center py-8 text-gray-700 dark:text-gray-300">Loading...</div>
            ) : filteredMeetings.length > 0 ? (
              filteredMeetings.map(content => (
                <Meeting key={content.id} content={content} />
              ))
            ) : (
              <div className="p-10 text-center text-gray-500 font-semibold">No Meetings Found</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Meetings;