import React, { useState } from 'react';
import EventCard from './components/EventCard';
import SIBbutton from './components/SIBbutton';
import CreateEvent from './components/CreateEvent';
import { EventsModal } from './components/EventModal';
import useFetch from '../hooks/useFetch';

function EventManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderStatus, setReminderStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const { data, loading, error } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/event/getallevents`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  function reminderHeader(event) {
    return `📅 Upcoming Event Reminder: ${event.event_title}`;
  }

  function reminderContent(event) {
    return `Don't forget! Your event '${event.event_title}' is happening soon! ⏳\n\n🗓 Date: ${new Date(event.event_date).toLocaleDateString()} at ${event.event_time}\n📍 Location: ${event.location || 'See event details'}\n\n${event.event_description ? '📝 ' + event.event_description : ''}\n\nSee you there! 👋`;
  }

  const sendEventReminder = async () => {
    setReminderStatus(null);
    setSending(true);

    try {
      const eventRes = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/event/getlatestevent`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!eventRes.ok) {
        const errMsg = (await eventRes.json()).message || "Failed to fetch event";
        throw new Error(errMsg);
      }
      const event = await eventRes.json();

      const payload = {
        header: reminderHeader(event),
        content: reminderContent(event),
      };

      const notifRes = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createbulknotifications`,
        {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
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
        border border-gray-200 dark:border-gray-700
        p-4 sm:p-6 lg:p-8
        transition-colors duration-300
      ">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6">
          Event Management
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-8">
          {data && data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {data.slice(0, 3).map((event, index) => (
                <EventCard
                  title={event.event_title}
                  date={event.event_date}
                  time={event.event_time}
                  location={event.location}
                  id={event._id}
                  status={event.event_status}
                  key={event._id || index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No events found</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <CreateEvent />
          <SIBbutton
            content="View All Events"
            onClick={() => setIsModalOpen(true)}
            variant="secondary"
          />
          <EventsModal
            events={data}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          <SIBbutton
            content={sending ? "Sending..." : "Send latest Event Reminder"}
            variant="secondary"
            onClick={sendEventReminder}
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

        {loading && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-200">Creating event...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventManagement;