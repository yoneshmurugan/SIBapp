import { useState } from 'react';
import SIBbutton from './components/SIBbutton';
import CreateMeeting from './components/CreateMeeting';
import EventCard from './components/EventCard';
import { MeetingsModal } from './components/MeetingModal';
import useFetch from '../hooks/useFetch';

function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const [reminderStatus, setReminderStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const { data: meetings, loading, error } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/meeting/getmeetings`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  function reminderHeader(meeting) {
    return `⏰ Meeting Reminder: ${meeting.title}`;
  }

  function reminderContent(meeting) {
    return `Get ready! The '${meeting.title}' meeting is coming up. 👥\n\n🗓 Date: ${new Date(meeting.meeting_date).toLocaleDateString()} at ${meeting.meeting_time}\n📍 Location: ${meeting.location || 'See meeting details'}\n⏱ Duration: ${meeting.duration} mins\n\n${meeting.meeting_notes ? '📌 ' + meeting.meeting_notes : ''}`;
  }

  const sendRemainder = async () => {
    setReminderStatus(null);
    setSending(true);

    try {
      const meetingRes = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/meeting/getlatestmeeting`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!meetingRes.ok) {
        const errMsg = (await meetingRes.json()).message || "Failed to fetch meeting";
        throw new Error(errMsg);
      }
      const meeting = await meetingRes.json();

      const payload = {
        header: reminderHeader(meeting),
        content: reminderContent(meeting),
      };

      const notifRes = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createbulknotifications`, {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      );

      const result = await notifRes.json();
      if (!notifRes.ok) {
        throw new Error(result.error || "Failed to send notifications");
      }

      setReminderStatus({
        success: true,
        count: result.count,
        message: result.message,
      });

    } catch (err) {
      setReminderStatus({
        success: false,
        message: err.message || "Error while sending reminder.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full">
      <div className="
        bg-white dark:bg-gray-900 
        rounded-2xl shadow-lg 
        border border-gray-200 dark:border-gray-900
        p-4 sm:p-6 lg:p-8
        transition-colors duration-300
      ">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 max-w-full break-words">
            Meeting Management
          </h1>

          <div className="mb-8">
            {loading && (
              <p className="text-center text-gray-600 dark:text-gray-400">Loading meetings...</p>
            )}
            {error && (
              <p className="text-center text-red-600 dark:text-red-400">
                Error loading meetings: {error.message || error.toString()}
              </p>
            )}
            {!loading && !error && meetings && meetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {meetings.slice(0,3).map((event, index) => (
                  <EventCard
                    id={event._id || ""}
                    title={event.title}
                    date={event.meeting_date}
                    time={event.meeting_time}
                    location={event.location}
                    status={event.meeting_status}
                    key={event._id || index}
                  />
                ))}
              </div>
            ) : (!loading && !error) && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No meetings found</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <CreateMeeting />
          <SIBbutton
            content="View Meetings"
            variant="secondary"
            onClick={() => setIsOpen(true)}
          />
          <MeetingsModal
            meetings={meetings}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
          <SIBbutton
            content={sending ? "Sending..." : "Send latest Meeting Reminder"}
            variant="secondary"
            onClick={sendRemainder}
            disabled={sending}
          />
        </div>

        {reminderStatus && (
          <div className={`mt-6 p-4 rounded-lg ${reminderStatus.success ? "bg-green-300 dark:bg-green-500/80 text-black" : "bg-red-400 dark:bg-red-500/80 text-black"}`}>
            {reminderStatus.success
              ? `Success! ${reminderStatus.message}${reminderStatus.count ? ` (${reminderStatus.count} users notified)` : ""}`
              : `Error: ${reminderStatus.message}`
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default Hero;
