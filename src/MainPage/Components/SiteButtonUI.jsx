import React from 'react'
import { NavLink } from 'react-router-dom'

function SiteButtonUI({
  style,
  style2,
  color = "text-black",
  content = "12 Sep 2025",
  display = "content",
  to = null
, need = true
}) {
  return (
    <NavLink
      to={to}
      className="
        px-4 py-2
        bg-yellow-50 dark:bg-yellow-200/10
        rounded-xl
        hover:bg-yellow-100/40 dark:hover:bg-yellow-200/30
        w-full h-full
        border-2 border-gray-400/50 dark:border-gray-500/40
        hover:border-gray-500/70 dark:hover:border-gray-300/70
        transition-all duration-200 ease-in-out
        cursor-pointer
        flex flex-col justify-center items-center
      "
    >
      {need ? <span
        className={`text-md font-medium [display:${display}] text-gray-800 dark:text-gray-100`}
        style={style}
      >
        Renewal Date
      </span> : null}
      <span
        className={`text-sm font-semibold ${color} dark:text-gray-200`}
        style={style2}
      >
        {content}
      </span>
    </NavLink>
  )
}

export default SiteButtonUI
