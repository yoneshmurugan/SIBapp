import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useState, useRef, useEffect } from "react";
import { FileText, Clock, Calendar as CalendarIcon, MapPin, Flag, X } from "lucide-react";

const meetingTypes = ["Weekly", "Monthly", "Others"];

export default function CreateEvent() {
  const [openModal, setOpenModal] = useState(false);
  const initialFocusRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetingType, setMeetingType] = useState("Weekly");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    if (!openModal) {
      setTimeout(() => setSuccess(false), 300);
    }
  }, [openModal]);

  const handler = () => {
    setOpenModal(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Event title is required.";
    if (!company.trim()) newErrors.company = "Event organizer company is required.";
    if (!date) newErrors.date = "Date is required.";
    if (!time) newErrors.time = "Time is required.";
    if ((meetingType === "Weekly" || meetingType === "Monthly") && !location.trim())
      newErrors.location = "Location is required for selected event type.";
    return newErrors;
  };

  const handleClear = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setMeetingType("Weekly");
    setCompany("");
    setErrors({});
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      const eventObj = {
        event_title: title,
        event_date: date,
        event_time: time,
        location,
        event_type: meetingType.toLowerCase(),
        event_description: description,
        event_status: "upcoming",
        organizer_company: company
      };

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/event/createevent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(eventObj)
        });
        const result = await res.json();
        if (result?.message === "success") {
          const notificationData = {
            header: `🎟️ A new Event has been scheduled.`,
            content: `A new Event titled ${title} has been scheduled for ${date} at ${time} in ${location}. Please review the meeting details and ensure your availability. Please mark your calendar and be prepared to attend.
            Thank you!`,
            read: false,
          };

          await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/notification/createbulknotifications`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(notificationData),
              credentials: "include",
            }
          );
          setId(result.id);
          setIsSubmitting(false);
          setSuccess(true);
        } else if (result?.errors) {
          const errMsg = result?.errors?.[0]
            ? `${result.errors[0].path} : ${result.errors[0].msg}`
            : (result?.message || "An error occurred.");
          setErrors({ api: errMsg });
          setIsSubmitting(false);
          setSuccess(false);
        } else {
          setErrors({ api: "An unknown error occurred." });
          setIsSubmitting(false);
          setSuccess(false);
        }
      } catch (err) {
        setErrors({ api: err.message || "Network error" });
        setIsSubmitting(false);
        setSuccess(false);
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setOpenModal(true)}
        className="bg-yellow-400 text-black font-semibold
                    hover:bg-yellow-500 rounded-lg
                    focus:ring-4 focus:ring-yellow-300
                    dark:bg-yellow-500 dark:text-gray-900 
                    dark:hover:bg-yellow-400 
                    dark:focus:ring-yellow-600
                    shadow-md hover:shadow-lg min-h-[40px]"
      >
        Create New Event
      </button>

      <Modal show={openModal} size="md" onClose={handler} popup initialFocus={initialFocusRef} className="bg-gray-900/50">
        <ModalHeader className="border-b-4 border-amber-300 px-8 py-5 bg-gradient-to-r from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create Event</h3>
            <button className="text-black dark:text-white" onClick={handler} aria-label="Close modal">
              <X />
            </button>
          </div>
        </ModalHeader>

        <ModalBody className="px-6 py-6 bg-white dark:bg-gray-900 rounded-xl">
          <form onSubmit={handleSubmit} noValidate className="space-y-5 mt-5">
            <div>
              <label htmlFor="title" className="block font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter Event title"
                ref={initialFocusRef}
                className={`w-full rounded-lg border-2 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${errors.title ? "border-red-500 dark:border-red-400 focus:ring-red-300" : "border-amber-200 dark:border-gray-700 focus:ring-amber-300"
                  } focus:outline-none focus:ring-2 transition`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={errors.title ? "true" : "false"}
              />
              {errors.title && <p className="mt-2 text-red-600 dark:text-red-400 text-sm font-medium">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="company" className="block font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Organizer Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="company"
                type="text"
                placeholder="Enter Organizer Company Name"
                className={`w-full rounded-lg border-2 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${errors.company ? "border-red-500 dark:border-red-400 focus:ring-red-300" : "border-amber-200 dark:border-gray-700 focus:ring-amber-300"
                  } focus:outline-none focus:ring-2 transition`}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                aria-invalid={errors.company ? "true" : "false"}
              />
              {errors.company && <p className="mt-2 text-red-600 dark:text-red-400 text-sm font-medium">{errors.company}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Description / Notes
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Optional description or notes about the Event"
                className="w-full rounded-lg border-2 border-amber-200 dark:border-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-500 transition resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  <CalendarIcon className="inline w-4 h-4 mr-2" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  className={`w-full rounded-lg border-2 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${errors.date ? "border-red-500 dark:border-red-400 focus:ring-red-300" : "border-amber-200 dark:border-gray-700 focus:ring-amber-300"
                    } focus:outline-none focus:ring-2 transition`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-invalid={errors.date ? "true" : "false"}
                />
                {errors.date && <p className="mt-2 text-red-600 dark:text-red-400 text-sm font-medium">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="time" className="block font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="time"
                  type="time"
                  className={`w-full rounded-lg border-2 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${errors.time ? "border-red-500 dark:border-red-400 focus:ring-red-300" : "border-amber-200 dark:border-gray-700 focus:ring-amber-300"
                    } focus:outline-none focus:ring-2 transition`}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-invalid={errors.time ? "true" : "false"}
                />
                {errors.time && <p className="mt-2 text-red-600 dark:text-red-400 text-sm font-medium">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 dark:text-gray-100 mb-3">Event Type</label>
              <div className="flex gap-4">
                {meetingTypes.map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="meetingType"
                      value={type}
                      checked={meetingType === type}
                      onChange={() => setMeetingType(type)}
                      className="w-5 h-5 text-amber-400 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {(meetingType === "Weekly" || meetingType === "Monthly") && (
              <div>
                <label htmlFor="location" className="block font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="Enter Event location"
                  className={`w-full rounded-lg border-2 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${errors.location ? "border-red-500 dark:border-red-400 focus:ring-red-300" : "border-amber-200 dark:border-gray-700 focus:ring-amber-300"
                    } focus:outline-none focus:ring-2 transition`}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  aria-invalid={errors.location ? "true" : "false"}
                />
                {errors.location && <p className="mt-2 text-red-600 dark:text-red-400 text-sm font-medium">{errors.location}</p>}
              </div>
            )}

            {errors.api && (
              <p className="mt-2 text-red-600 dark:text-red-400 text-sm font-medium">{errors.api}</p>
            )}

            {success && (
              <div className="p-4 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 rounded-lg">
                <p className="text-green-700 dark:text-green-300 font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  Event created successfully with id : {id}!
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                color="gray"
                onClick={handler}
                className="px-6 py-2 rounded-lg border-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                disabled={isSubmitting}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(validate()).length > 0}
                className="px-8 py-3 bg-amber-300 text-gray-900 dark:text-gray-900 rounded-lg hover:from-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                Create Event
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}