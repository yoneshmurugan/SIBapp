import React, { useState } from "react";
import MemberCard from "../MemberCard/MemberCard";

const ITEMS_PER_PAGE = 10;

const MemberList = ({ members }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentMembers = members.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="w-full pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8 place-items-center w-full">
        {currentMembers.map((member, index) => (
          <MemberCard
            key={index}
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
      <div className="flex flex-wrap justify-center items-center gap-2 mt-8 px-2">
        <button
          className="shrink-0 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-300 font-bold text-sm shadow-sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`shrink-0 w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${
              page === currentPage
                ? "bg-amber-400 text-amber-950 scale-110"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="shrink-0 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-300 font-bold text-sm shadow-sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MemberList;
