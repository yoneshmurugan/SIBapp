import React, { useState, useEffect, useMemo } from "react";
import MemberCard from "../MemberCard/MemberCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Double of previous 10 cards per page
const ITEMS_PER_PAGE = 20;

function getPaginationRange(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - 1, 1);
  const rightSibling = Math.min(current + 1, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 2;

  // Case 1: Only right dots
  if (!showLeftDots && showRightDots) {
    const leftItemCount = 4;
    return [...Array.from({ length: leftItemCount }, (_, i) => i + 1), "...", total];
  }

  // Case 2: Only left dots
  if (showLeftDots && !showRightDots) {
    const rightItemCount = 4;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1);
    return [1, "...", ...rightRange];
  }

  // Case 3: Both left and right dots
  if (showLeftDots && showRightDots) {
    return [1, "...", leftSibling, current, rightSibling, "...", total];
  }

  return Array.from({ length: total }, (_, i) => i + 1);
}

const MemberList = ({ members }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);

  // Reset to page 1 if member count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [members.length]);

  // Keep page within valid bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentMembers = members.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const paginationRange = useMemo(() => {
    return getPaginationRange(currentPage, totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="w-full pb-10">
      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center w-full">
        {currentMembers.map((member, index) => (
          <MemberCard
            key={member._id || index}
            member={{
              profile_image_url: member.profile_image_url,
              blood_group: member.blood_group,
              username: member.user.username,
              company_name: member.company_name,
              verticals: Array.isArray(member.vertical_ids) && member.vertical_ids.length > 0 
                ? member.vertical_ids[0] 
                : (Array.isArray(member.verticals) && member.verticals.length > 0 
                    ? member.verticals[0] 
                    : member.verticals || "N/A"),
              chapter: member.chapter,
              region: member.region,
            }}
            profileurl=""
            contactdetails={{
              company_phone: member.company_phone,
              company_email: member.company_email,
              company_address: member.company_address
            }}
            extraDetails={{
              vagai_category: member.vagai_category,
              kulam_category: member.kulam_category,
              native_place: member.native_place,
              kuladeivam: member.kuladeivam,
              services: member.services,
              all_verticals: Array.isArray(member.vertical_ids) ? member.vertical_ids : (Array.isArray(member.verticals) ? member.verticals : [member.verticals])
            }}
            link={`https://senguntharinbusiness.com/profile/${member._id}?user=${member.user._id}`}
          />
        ))}
      </div>

      {/* Sliding Window Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 mt-10 px-2">
          <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
            
            {/* Prev Button */}
            <button
              className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs sm:text-sm shadow-sm active:scale-95"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Number & Ellipsis Buttons */}
            {paginationRange.map((item, idx) => {
              if (item === "...") {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="shrink-0 w-8 sm:w-10 text-center font-bold text-gray-400 dark:text-gray-600 select-none text-sm"
                  >
                    …
                  </span>
                );
              }

              const isActive = item === currentPage;
              return (
                <button
                  key={item}
                  className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 ${
                    isActive
                      ? "bg-amber-400 text-gray-950 font-black shadow-md shadow-amber-400/20 scale-105 ring-2 ring-amber-400/40"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => handlePageChange(item)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs sm:text-sm shadow-sm active:scale-95"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Showing Count Information */}
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-700 dark:text-gray-300">{startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, members.length)}</span> of <span className="font-bold text-gray-700 dark:text-gray-300">{members.length}</span> members
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberList;