import { useState, useEffect } from "react";
import {
  HiOutlineExclamationCircle,
  HiX,
  HiPencil,
  HiCheck,
  HiClock,
  HiCalendar,
  HiLocationMarker,
} from "react-icons/hi";
import useFetch from "../../hooks/useFetch";

export function MeetingsModal({ meetings = [], isOpen, onClose }) {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState(null);
  const [canedit, setCanedit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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

  const handleViewDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setEditedMeeting({ ...meeting });
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedMeeting({ ...selectedMeeting });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedMeeting({ ...editedMeeting, [field]: value });
  };

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/meeting/updatemeeting`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editedMeeting),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update meeting");
      }

      if (result.message === "success") {
        setSelectedMeeting(editedMeeting);
        setIsEditing(false);
      } else {
        throw new Error(result.message || "Failed to update meeting");
      }
    } catch (error) {
      setSaveError(error.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedMeeting(null);
    setIsEditing(false);
    setSaveError(null);
  };

  const handleMainClose = () => {
    setSelectedMeeting(null);
    setIsEditing(false);
    setSaveError(null);
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
      <div className="fixed inset-0 z-50 flex items-center bg-black/30 justify-center overflow-y-auto overflow-x-hidden bg-opacity-50 dark:bg-opacity-70">
        <div className="relative max-h-full w-full max-w-4xl p-4">
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Meetings
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
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-500 dark:text-gray-400">No meetings found</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting._id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {meeting.title}
                          </h4>
                          <div className="space-y-1.5">
                            {meeting.chapter && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Chapter:</span>
                                <span>{meeting.chapter.chapter_name}</span>
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <HiCalendar className="mr-2 h-4 w-4 text-amber-300" />
                              <span>{formatDate(meeting.meeting_date)}</span>
                              <HiClock className="ml-4 mr-2 h-4 w-4 text-amber-300" />
                              <span>
                                {meeting.meeting_time} ({meeting.duration || "N/A"}) Minutes
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <HiLocationMarker className="mr-2 h-4 w-4 text-amber-300" />
                              <span>{meeting.location || "Not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 capitalize">
                                {meeting.meeting_type}
                              </span>
                              <span
                                className={`text-xs font-medium px-2.5 py-0.5 rounded capitalize ${
                                  meeting.meeting_status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : meeting.meeting_status === "cancelled"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : meeting.meeting_status === "upcoming"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {meeting.meeting_status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDetails(meeting)}
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

      {selectedMeeting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/40 bg-opacity-60 dark:bg-opacity-80">
          <div className="relative max-h-full w-full max-w-2xl p-4">
            <div className="relative rounded-lg bg-white shadow-xl dark:bg-gray-800">
              <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? "Edit Meeting" : "Meeting Details"}
                </h3>
                <div className="flex items-center space-x-2">
                  {!isEditing && canedit && (
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="inline-flex items-center rounded-lg bg-amber-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-300"
                    >
                      <HiPencil className="mr-1 h-4 w-4" />
                      Edit
                    </button>
                  )}
                  {isEditing && canedit && (
                    <>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-green-300 ${
                          isSaving
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isSaving ? (
                          <svg
                            className="animate-spin h-5 w-5 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
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
                  )}
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
                {saveError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{saveError}</p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Meeting Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedMeeting.title || ""}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-300 focus:ring-amber-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-base text-gray-900 dark:text-white">
                      {selectedMeeting.title}
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
                      value={editedMeeting.meeting_notes || ""}
                      onChange={(e) =>
                        handleInputChange("meeting_notes", e.target.value)
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-300 focus:ring-amber-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedMeeting.meeting_notes || "No description provided"}
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
                        value={formatDate(editedMeeting.meeting_date)}
                        onChange={(e) =>
                          handleInputChange("meeting_date", e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-300 focus:ring-amber-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white flex items-center">
                        <HiCalendar className="mr-2 h-4 w-4 text-amber-300" />
                        {formatDate(selectedMeeting.meeting_date)}
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
                        value={editedMeeting.meeting_time || ""}
                        onChange={(e) =>
                          handleInputChange("meeting_time", e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-300 focus:ring-amber-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white flex items-center">
                        <HiClock className="mr-2 h-4 w-4 text-amber-300" />
                        {selectedMeeting.meeting_time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Meeting Type
                    </label>
                    {isEditing ? (
                      <select
                        value={editedMeeting.meeting_type || ""}
                        onChange={(e) =>
                          handleInputChange("meeting_type", e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-300 focus:ring-amber-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="others">Others</option>
                      </select>
                    ) : (
                      <span className="inline-block rounded bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300 capitalize">
                        {selectedMeeting.meeting_type}
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
                        value={editedMeeting.location || ""}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        placeholder="Meeting location or link"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-300 focus:ring-amber-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white flex items-center">
                        <HiLocationMarker className="mr-2 h-4 w-4 text-amber-300" />
                        {selectedMeeting.location || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Meeting Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editedMeeting.meeting_status || "upcoming"}
                      onChange={(e) =>
                        handleInputChange("meeting_status", e.target.value)
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-300 focus:ring-amber-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="inprogress">In Progress</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block rounded px-2.5 py-1 text-xs font-medium capitalize ${
                        selectedMeeting.meeting_status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : selectedMeeting.meeting_status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : selectedMeeting.meeting_status === "inprogress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {selectedMeeting.meeting_status}
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
