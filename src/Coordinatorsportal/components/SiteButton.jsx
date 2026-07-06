import React from 'react'
import { NavLink } from 'react-router-dom'

function SiteButton({
    to = '/' , content = "Hello"
}) {
    return (
        <NavLink
            to={to}
            className="
        px-4 py-2
        bg-yellow-50 dark:bg-yellow-200/20
        rounded-xl text-nowrap
        hover:bg-yellow-100/40 dark:hover:bg-yellow-200/30
        w-full h-full 
        border-2 border-gray-400/50 dark:border-gray-500/40
        hover:border-gray-500/70 dark:hover:border-gray-300/70
        transition-all duration-200 ease-in-out
        cursor-pointer
        flex flex-col justify-center items-center
      "
        >
            <span
                className={`text-sm font-semibold text-black dark:text-amber-400`}
            >
                {content}
            </span>
        </NavLink>
    )
}

export default SiteButton