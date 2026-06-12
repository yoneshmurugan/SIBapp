import { Button, Modal, ModalHeader, ModalBody } from "flowbite-react";
import { useState, useRef } from "react";

export function DetailsComponent({ data }) {
  const allVerticals = data.all_verticals || [];
  const services = data.services || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Full Size Profile Photo */}
      {data.profile_image_url && (
        <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden mb-2">
          <img 
            src={data.profile_image_url} 
            alt="Profile" 
            className="w-full h-auto max-h-[70vh] object-contain mx-auto"
          />
        </div>
      )}
      
      {/* Verticals Section */}
      <div className="flex flex-col">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">
          Business Verticals
        </h4>
        <div className="flex flex-wrap gap-2">
          {allVerticals.length > 0 ? (
            allVerticals.map((v, i) => (
              <span key={i} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg text-[12px] font-bold border border-amber-200 dark:border-amber-800/50">
                {v}
              </span>
            ))
          ) : (
            <span className="text-sm italic text-gray-500">None</span>
          )}
        </div>
      </div>

      {/* Services Section */}
      <div className="flex flex-col">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">
          Services Offered
        </h4>
        <div className="flex flex-wrap gap-2">
          {services.length > 0 ? (
            services.map((s, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-[12px] font-bold">
                {s}
              </span>
            ))
          ) : (
            <span className="text-sm italic text-gray-500">None</span>
          )}
        </div>
      </div>

      {/* Cultural Section */}
      <div className="flex flex-col">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">
          Cultural Details
        </h4>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px]">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">வகையறா (Sub-caste)</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{data.vagai_category || "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">கூட்டம் (Gothram)</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{data.kulam_category || "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">சேர்ந்த இடம் (Native)</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{data.native_place || "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">குலதெய்வம் (Deity)</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{data.kuladeivam || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalViewerDetails({ data = {}, isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

  const initialFocusRef = useRef(null);

  return (
    <>
      {!externalIsOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-[35px] cursor-pointer w-full max-w-[165px] bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-[12px] font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300 shadow-sm mx-auto"
        >
          View All Details
        </button>
      )}
      
      <Modal
        show={isOpen}
        size="md"
        onClose={() => setIsOpen(false)}
        popup
        initialFocus={initialFocusRef}
      >
        <ModalHeader className="dark:bg-gray-800" />
        <ModalBody className="dark:bg-gray-800 rounded-b-lg">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
              Member Details
            </h3>
            <DetailsComponent data={data} />
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-sm transition-all shadow-sm active:scale-95"
                onClick={() => setIsOpen(false)}
                ref={initialFocusRef}
              >
                Close
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
