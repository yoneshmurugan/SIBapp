import React, { useState } from 'react';
import { ModalViewerDetails } from '../../Members/Components/CulturalModal';
import { ModalViewer } from '../../Members/Components/Modalcontactviewer';
import { Modal, ModalBody, ModalHeader } from 'flowbite-react';
import { NavLink } from 'react-router-dom';
import { User, Phone } from 'lucide-react';

function MemberCard({ member }) {
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    
    const extraDetails = {
        profile_image_url: member.profile_image_url,
        services: member.services || member.services_offered || [],
        all_verticals: Array.isArray(member.verticals) ? member.verticals : [member.verticals],
        vagai_category: member.vagai_category,
        kulam_category: member.kulam_category,
        native_place: member.native_place,
        kuladeivam: member.kuladeivam
    };

    const contactDetails = {
        company_phone: member.company_phone,
        company_email: member.company_email,
        company_address: member.company_address
    };

    const firstVertical = Array.isArray(member.verticals) && member.verticals.length > 0 
        ? member.verticals[0] 
        : member.verticals || "N/A";

    const profileImage = member.profile_image_url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <div className="flex flex-col w-full h-full">
            <div className="relative bg-white dark:bg-gray-900 w-full rounded-2xl flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden pb-4">
                
                {/* Profile Image - Now Triggers Details Modal */}
                <div className="w-full h-28 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center p-3">
                    <div 
                        className="h-20 w-20 bg-gray-200 dark:bg-gray-800 rounded-full border-2 border-white dark:border-gray-900 relative shadow-sm cursor-pointer active:scale-95 transition-transform group"
                        onClick={() => setIsDetailsModalOpen(true)}
                    >
                        <img
                            src={profileImage}
                            alt={member.display_name}
                            className="h-full w-full rounded-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors flex items-center justify-center">
                            <span className="text-[8px] font-black text-white opacity-0 group-hover:opacity-100 uppercase tracking-tighter">Details</span>
                        </div>
                        {member.blood_group && (
                            <div className="absolute bottom-0 right-0 h-6 w-6 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                                <span className="text-[8px] font-black text-white">{member.blood_group}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-3 w-full flex flex-col items-center text-center">
                    <h3 className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight mt-1 line-clamp-1">
                        {member.user?.username || member.display_name}
                    </h3>
                    <p className="text-[11px] font-semibold text-amber-600 mb-2 line-clamp-1">
                        {member.company_name}
                    </p>

                    <div className="w-full bg-amber-50 dark:bg-amber-900/10 py-1.5 px-2 rounded-lg mb-3 border border-amber-100 dark:border-amber-800/30">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 line-clamp-1">
                            {firstVertical}
                        </span>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 mb-4">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-gray-400">Chapter</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300 uppercase">
                                {member.chapter?.split(' ').map(w => w[0]).join('').toUpperCase() || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-gray-400">Region</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{member.region || "N/A"}</span>
                        </div>
                    </div>

                    {/* View All Detail Button & Controlled Modal */}
                    <div className="w-full mb-4">
                        <ModalViewerDetails 
                            data={extraDetails} 
                            isOpen={isDetailsModalOpen} 
                            setIsOpen={setIsDetailsModalOpen} 
                        />
                    </div>

                    {/* Action Footer */}
                    <div className="w-full flex items-center gap-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                        <NavLink 
                            to={`/profile/${member._id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <User className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">Profile</span>
                        </NavLink>
                        
                        <div className="flex-1">
                            <ModalViewer contactdetails={contactDetails} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MemberCard;
