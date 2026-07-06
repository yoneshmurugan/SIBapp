import React, { useState } from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

// --- ORIGINAL IMPORTS (Commented out to prevent errors while under construction) ---
// import EntryField from '../Components/EntryField';
// import RadioButtons from '../Components/RadioButtons';
// import SelectButtons from '../Components/SelectButtons';
// import FilterButton from '../Members/Components/FilterButton';
// import { getDate } from '../utils/getDate.mjs'
// import { X } from 'lucide-react';
// import CrossChapterSearch from "../Components/CrossSearch";

function ButtonPage({ onClose = () => console.log("Closing...") }) {

  // --- NEW: UNDER CONSTRUCTION VIEW ---
  return (
    <div className="flex flex-1 items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-gray-700">
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full animate-pulse">
            <Construction className="w-16 h-16 text-yellow-600 dark:text-yellow-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Work in Progress
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The Visitor Slip backend is currently under construction. Please check back later.
        </p>

        <button
          onClick={onClose}
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors w-full dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    </div>
  );

  /* --- ORIGINAL CODE (Commented out for preservation) ---
  
  const todaysDate = getDate();

  const [registrationChapter, setRegistrationChapter] = useState('');
  const [visitDate, setVisitDate] = useState(todaysDate);
  const [Industry, setIndustry] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postCode, setPostCode] = useState('');
  const [category, setCategory] = useState('');
  const [visitorType, setVisitorType] = useState('Visitor');
  const [confirmation, setConfirmation] = useState(false);

  const handleSubmit = () => {
    const formData = {
      registrationChapter,
      visitDate,
      Industry,
      firstName,
      email,
      phone,
      companyName,
      addressLine1,
      addressLine2,
      city,
      state,
      postCode,
      category,
      visitorType,
      confirmation,
    };

    console.log('Form Submitted:', formData);
  }

  return (
    <div className=" flex flex-1 items-center justify-around min-h-screen p-4">
      <div className="max-w-full bg-white dark:bg-gray-900 p-5 rounded-2xl flex flex-col gap-3 shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="header border-b-2 border-gray-300 dark:border-gray-600 pb-2 flex justify-between">
          <p className="font-bold text-gray-900 dark:text-gray-100">Visitors Slip</p>
          <button
            className="font-bold text-gray-900 dark:text-gray-100 hover:text-red-500 dark:hover:text-red-400"
            onClick={onClose}
          >
            <X />
          </button>
        </div>

        <div className="header flex gap-2 my-4 justify-between w-full">
          <button className="text-sm font-semibold border-b-4 border-gray-400 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-400 pb-2 mr-4 dark:text-gray-100">
            Register someone else (To visit my chapter)
          </button>
          <button className="text-sm font-semibold border-b-4 border-gray-400 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-400 pb-2 dark:text-gray-100">
            Register Myself (To visit Another chapter)
          </button>
        </div>

        <div className="header border-b-2 border-gray-300 dark:border-gray-600 pb-2 mt-5">
          <p className="font-semibold text-gray-900 dark:text-gray-100">Registration Details</p>
        </div>

        <div className="flex w-full gap-4">
          
          <CrossChapterSearch
            label="Registration Chapter"
            placeholder="Chapter Name to be visited"
            onChange={setRegistrationChapter}
            offsubmit={true}
            searchdomain="searchchapter"
          />

          <EntryField
            type="date"
            placeholder={todaysDate}
            label="Visit Date"
            value={visitDate}
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setVisitDate}
          />
        </div>

        <div className="header border-b-2 border-gray-300 dark:border-gray-600 pb-2 mt-10">
          <p className="font-semibold text-gray-900 dark:text-gray-100">Visitor Details</p>
        </div>

        <div className="flex w-full gap-4">
          <EntryField
            type="text"
            placeholder="Enter Industry"
            label="Industry"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setIndustry}
          />
          <EntryField
            type="text"
            placeholder="Enter First Name"
            label="Name"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setFirstName}
          />
        </div>

        <div className="flex w-full gap-4">
          <EntryField
            type="email"
            placeholder="Enter Email Address"
            label="Email Address"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setEmail}
          />
          <EntryField
            type="tel"
            placeholder="Enter Phone Number"
            label="Phone Number"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setPhone}
          />
        </div>

        <EntryField
          type="text"
          placeholder="Enter Company Name"
          label="Company Name (Optional)"
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          onChange={setCompanyName}
        />

        <div className="flex w-full gap-4">
          <EntryField
            type="text"
            placeholder=""
            label="Address Line1 (Optional)"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setAddressLine1}
          />
          <EntryField
            type="text"
            placeholder=""
            label="Address Line2 (Optional)"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setAddressLine2}
          />
        </div>

        <div className="flex w-full gap-4">
          <EntryField
            type="text"
            placeholder=""
            label="City (Optional)"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setCity}
          />
          <EntryField
            type="text"
            placeholder=""
            label="State (Optional)"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setState}
          />
          <EntryField
            type="text"
            placeholder=""
            label="Post Code"
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            onChange={setPostCode}
          />
        </div>

        <div className="header border-b-2 border-gray-300 dark:border-gray-600 pb-2 mt-10">
          <p className="font-semibold text-gray-900 dark:text-gray-100">Other Details</p>
        </div>

        <EntryField
          type="text"
          placeholder="Enter Category"
          label="Business Category"
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          onChange={setCategory}
        />

        <RadioButtons
          label="Visitor Type"
          buttons={[
            { name: 'Visitor', value: 'Visitor' },
            { name: 'Guest', value: 'Guest' },
            { name: 'Substitute', value: 'Substitute' },
          ]}
          onChange={setVisitorType}
        />

        <SelectButtons
          label=""
          items={[{ name: 'I confirm to allow the system to send invitations to the visitor on my behalf' }]}
          onChange={setConfirmation}
        />

        <div className="mt-2 flex w-full justify-end gap-4 border-t-2 border-gray-300 dark:border-gray-600 pt-3">
          <FilterButton
            content="Close"
            bg="bg-white dark:bg-gray-700"
            hover="hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={onClose}
          />
          <FilterButton
            content="Submit"
            bg="bg-yellow-300 dark:bg-yellow-500"
            hover="hover:bg-yellow-400 dark:hover:bg-yellow-600"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
  */
}

export default function App() {
  return <ButtonPage />;
}