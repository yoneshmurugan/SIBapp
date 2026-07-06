import { ModalViewer } from '../Components/Modalcontactviewer';
import { ModalViewerDetails } from '../Components/CulturalModal';
import { NavLink } from 'react-router-dom';

function MemberCard({
  member = {
    profile_image_url: "/src/assets/19.jpg",
    blood_group: "O+",
    username: "Yonesh Murugan",
    company_name: "IT professional",
    verticals: "Photography and Services",
    chapter: "Alpha Chapter",
    region: "Erode",
  },
  extraDetails = {},
  contactdetails = {},
  link
}) {
  return (
    /* 1. Increased Max Width: max-w-[300px] allows more space for text.
       2. mx-auto: Centers the card in its grid cell on mobile.
    */
    <div className="flex flex-col pt-12 w-full max-w-[280px] mx-auto h-full">
      
      {/* Card Body */}
      <div className="relative bg-white dark:bg-gray-800 w-full rounded-2xl flex flex-col flex-1 shadow-md hover:shadow-xl transition-all duration-300 pb-4">
        
        {/* --- Profile Image (Floating) --- */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-[5]">
          <div className="h-[100px] w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg border-2 border-white dark:border-gray-800 relative overflow-hidden">
            <img
              src={member.profile_image_url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              alt={member.username}
              className="h-full w-full object-cover object-top"
            />
            {/* Blood Group Badge */}
            <div className="h-[24px] w-[24px] rounded-full bg-red-500 absolute bottom-1 right-1 font-bold border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <p className="text-white text-[8px]">{member.blood_group}</p>
            </div>
          </div>
        </div>
 
        {/* --- Main Content Area --- */}
        <div className="flex flex-col flex-1 pt-16 px-4">
          
          {/* Name & Company */}
          <div className="text-center w-full mb-3">
            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">
              {member.username}
            </h4>
            <p className="text-[12px] font-bold text-amber-600 dark:text-amber-400 mt-0.5 line-clamp-1">
              {member.company_name}
            </p>
          </div>
 
          {/* Verticals Badge */}
          <div className="w-full mb-4">
            <div className="bg-amber-400 dark:bg-amber-500 py-1.5 px-2 rounded-xl w-full text-center shadow-sm">
              <p className="font-black text-[10px] uppercase tracking-wider text-amber-950 line-clamp-2">
                {member.verticals}
              </p>
            </div>
          </div>
 
          {/* Chapter & Region Details */}
          <div className="w-full space-y-1.5 px-1">
            <div className="flex justify-between items-center w-full">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Chapter</p>
              <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                {member.chapter?.split(' ').map(word => word[0]).join('').toUpperCase() || "SIB"}
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Region</p>
              <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{member.region}</p>
            </div>
          </div>
          
          <div className="mt-auto pt-6 mb-4 flex justify-center">
             <ModalViewerDetails data={extraDetails} />
          </div>
        </div>
 
        {/* --- Footer (Contact + Button) --- */}
        <div className="px-4 pb-1">
          <div className="flex flex-row items-center w-full gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            {/* Contact Modal */}
            <div className="shrink-0">
               <ModalViewer contactdetails={contactdetails} />
            </div>
 
            {/* View Profile Button */}
            <NavLink
              to={link}
              className="flex-1 flex justify-center items-center h-[38px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 px-2 overflow-hidden"
            >
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wide whitespace-nowrap">View Profile</span>
            </NavLink>
          </div>
        </div>
 
      </div>
    </div>
  );
}

export default MemberCard;