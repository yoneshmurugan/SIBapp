import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import {
  HiX,
  HiPencil,
  HiCheck,
  HiClock,
  HiCalendar,
  HiLocationMarker,
  HiUserGroup,
} from "react-icons/hi";

export function EventsModal({ events = [], isOpen, onClose }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [errors, setErrors] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [canedit, setCanedit] = useState(false);

  const { data: access } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/caneditevents`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  useEffect(() => {
    if (access && typeof access.hasaccess === "boolean") {
      setCanedit(access.hasaccess);
    }
  }, [access]);

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setEditedEvent({ ...event });
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedEvent({ ...selectedEvent });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedEvent({ ...editedEvent, [field]: value });
  };

  const handleSave = async () => {
    setErrors(null);
    setIsSaving(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/event/updateevent`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editedEvent),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update event");
      }

      if (result.message === "success") {
        setSelectedEvent(editedEvent);
        setIsEditing(false);
      } else {
        throw new Error(result.message || "Failed to update event");
      }
    } catch (error) {
      setErrors(error.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const handleMainClose = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/40 bg-opacity-50 dark:bg-opacity-70">
        <div className="relative max-h-full w-full max-w-4xl p-4">
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Events
              </h3>
              <button
                type="button"
                onClick={handleMainClose}
                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label="Close modal"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 p-6">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <HiUserGroup className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-500 dark:text-gray-400">No events found</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {event.event_title}
                          </h4>
                          <div className="space-y-1.5">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <HiUserGroup className="mr-2 h-4 w-4 text-amber-300" />
                              <span>{event.organizer_company || "Not specified"}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <HiCalendar className="mr-2 h-4 w-4 text-amber-300" />
                              <span>{formatDate(event.event_date)}</span>
                              <HiClock className="ml-4 mr-2 h-4 w-4 text-amber-300" />
                              <span>{event.event_time}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <HiLocationMarker className="mr-2 h-4 w-4 text-amber-300" />
                              <span>{event.location || "Not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 capitalize">
                                {event.event_type}
                              </span>
                              <span
                                className={`inline-block rounded px-2.5 py-0.5 text-xs font-medium capitalize ${
                                  event.event_status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : event.event_status === "cancelled"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : event.event_status === "upcoming"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {event.event_status || "upcoming"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDetails(event)}
                          className="ml-4 rounded-lg bg-amber-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/40 bg-opacity-60 dark:bg-opacity-80">
          <div className="relative max-h-full w-full max-w-2xl p-4">
            <div className="relative rounded-lg bg-white shadow-xl dark:bg-gray-800">
              <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? "Edit Event" : "Event Details"}
                </h3>
                <div className="flex items-center space-x-2">
                  {!isEditing && canedit ? (
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="inline-flex items-center rounded-lg bg-amber-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-300"
                    >
                      <HiPencil className="mr-1 h-4 w-4" />
                      Edit
                    </button>
                  ) : canedit ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium ${
                          isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                        } text-white focus:outline-none focus:ring-4 focus:ring-green-300`}
                      >
                        {isSaving ? (
                          <svg
                            className="animate-spin h-5 w-5 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                        ) : (
                          <HiCheck className="mr-1 h-4 w-4" />
                        )}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className="ml-2 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                    aria-label="Close details modal"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {errors && (
                  <p className="mt-2 text-red-600 dark:text-red-400 text-sm font-medium">{errors}</p>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Event Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEvent.event_title || ""}
                      onChange={(e) => handleInputChange("event_title", e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-base text-gray-900 dark:text-white">{selectedEvent.event_title}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Organizer / Company Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEvent.organizer_company || ""}
                      onChange={(e) => handleInputChange("organizer_company", e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-white flex items-center">
                      <HiUserGroup className="mr-2 h-4 w-4 text-amber-300" />
                      {selectedEvent.organizer_company || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Description / Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      rows="4"
                      value={editedEvent.event_description || ""}
                      onChange={(e) => handleInputChange("event_description", e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedEvent.event_description || "No description provided"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formatDate(editedEvent.event_date)}
                        onChange={(e) => handleInputChange("event_date", e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white flex items-center">
                        <HiCalendar className="mr-2 h-4 w-4 text-amber-300" />
                        {formatDate(selectedEvent.event_date)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Time
                    </label>
                    {isEditing ? (
                      <input
                        type="time"
                        value={editedEvent.event_time || ""}
                        onChange={(e) => handleInputChange("event_time", e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white flex items-center">
                        <HiClock className="mr-2 h-4 w-4 text-amber-300" />
                        {selectedEvent.event_time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Event Type
                    </label>
                    {isEditing ? (
                      <select
                        value={editedEvent.event_type || ""}
                        onChange={(e) => handleInputChange("event_type", e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="others">Others</option>
                      </select>
                    ) : (
                      <span className="inline-block rounded bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300 capitalize">
                        {selectedEvent.event_type}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedEvent.location || ""}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Event location or link"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white flex items-center">
                        <HiLocationMarker className="mr-2 h-4 w-4 text-amber-300" />
                        {selectedEvent.location || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Event Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editedEvent.event_status || "upcoming"}
                      onChange={(e) => handleInputChange("event_status", e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="inprogress">In Progress</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block rounded px-2.5 py-1 text-xs font-medium capitalize ${
                        selectedEvent.event_status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : selectedEvent.event_status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : selectedEvent.event_status === "inprogress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {selectedEvent.event_status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
