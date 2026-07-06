import React from "react"

const EventCard = ({
  id = "" ,
  title = 'Workshop - "The Future of AI"',
  date = "15 Nov 2025",
  time = "3:00 PM",
  location = null,
  status = "completed",
  onClick = null,
  attendees = null,
  onEdit = null,
  onDelete = null,
}) => {
  const statusColors = {
    upcoming: 'border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800',
    ongoing: 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800',
    completed: 'border-gray-300 bg-gray-100 dark:bg-gray-900 dark:border-gray-800',
    cancelled: 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800',
  }

  const statusTextColors = {
    upcoming: 'text-blue-700 dark:text-blue-300',
    ongoing: 'text-green-700 dark:text-green-300',
    completed: 'text-gray-700 dark:text-gray-300',
    cancelled: 'text-red-700 dark:text-red-300',
  }

  const selectedStatusColor = statusColors[status] || statusColors.upcoming
  const selectedStatusTextColor = statusTextColors[status] || statusTextColors.upcoming

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  return (
    <div
      onClick={onClick}
      className={`
        w-full sm:min-w-[280px] min-w-0 rounded-lg border-2
        p-4 sm:p-5
        shadow-md hover:shadow-lg
        transition-all duration-200
        ${selectedStatusColor}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        flex flex-col gap-3
      `}
      key={id}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`
          text-xs font-bold uppercase tracking-wide
          ${selectedStatusTextColor}
        `}>
          {status}
        </span>
        {attendees && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            👥 {attendees}
          </span>
        )}
      </div>

      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-50 whitespace-normal break-words max-w-full overflow-hidden">
        {title}
      </h3>

      <div className="flex flex-col gap-1 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span>📅</span>
          <span>{formatDate(date)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span>🕐</span>
          <span>{time}</span>
        </div>
      </div>

      {location && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <span>📍</span>
          <span className="truncate">{location}</span>
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-300 dark:border-gray-700">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="
                flex-1 px-3 py-2 rounded text-xs font-medium
                bg-gray-200 dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                hover:bg-gray-300 dark:hover:bg-gray-700
                transition-colors duration-200
              "
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="
                flex-1 px-3 py-2 rounded text-xs font-medium
                bg-red-200 dark:bg-red-900
                text-red-900 dark:text-red-100
                hover:bg-red-300 dark:hover:bg-red-800
                transition-colors duration-200
              "
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default EventCard
