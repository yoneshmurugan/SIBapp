import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useState, useRef } from "react";
import { Phone, Mail, MapPin} from "lucide-react";


export function ModalViewer({contactdetails = {}}) {
  const [openModal, setOpenModal] = useState(false);
  const initialFocusRef = useRef(null);

  const handler = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpenModal(true)}
        className="h-[35px] cursor-pointer w-3/4 text-nowrap bg-red-600 p-1 rounded-2xl hover:bg-red-500 border-2 text-[12px] font-bold border-gray-400 dark:border-gray-600 text-amber-50 transition-colors duration-300 mr-5 ml-1" // Adjusted margin-left
      >
        <Phone className="w-4 h-4 text-amber-50" />
      </Button>

      <Modal
        show={openModal}
        size="md"
        onClose={handler}
        popup
        initialFocus={initialFocusRef}
      >
        <ModalHeader>Contact Details</ModalHeader>
        <ModalBody>
          <div className="space-y-3 text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-amber-400" />
              <a ref={initialFocusRef} href={"tel:"+contactdetails.company_phone} className="text-blue-500">{contactdetails.company_phone}</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-400" />
              <a href={"mailto:"+contactdetails.company_email} className="text-blue-500">{contactdetails.company_email}</a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>{contactdetails.company_address}</span>
            </div>
            <div className="flex justify-center mt-6">
              <Button color="gray" onClick={handler}>
                Close
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
