import CrossChapterSearch from "../Components/CrossSearch";
import EntryField from "../Components/EntryField";
import RadioButtons from "../Components/RadioButtons";
import SelectButtons from "../Components/SelectButtons";
import TextArea from "../Components/TextArea";
import HeatScale from "../Components/HeatScale";
import FilterButton from "../Members/Components/FilterButton";
import { useEffect, useState } from "react";
import { getDate } from "../utils/getDate.mjs";
import { Handshake, X, User, FileText, Phone } from "lucide-react";
import { Contacts } from '@capacitor-community/contacts';
import { sanitizeReferralData } from "../utils/slipsSanitization.mjs";
import ContactPicker from "./ContactPicker";

function ButtonPage({ onClose = () => { } }) {
  const todaysDate = getDate();

  const [date, setDate] = useState(todaysDate);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [referralDetails, setReferralDetails] = useState("");
  const [referralType, setReferralType] = useState("tier1");
  const [referralStatus, setReferralStatus] = useState([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [comments, setComments] = useState("");
  const [heatScale, setHeatScale] = useState("cold");
  const [contactName, setContactName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [username, setUsername] = useState("loading...");
  const [userData, setUserData] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      if (userData?.email) setEmail(referralType !== 'tier2' ? userData.email || "" : "");
      if (userData?.phone_number) setPhone(referralType !== 'tier2' ? userData.phone_number || "" : "");
    }
  }, [userData, referralType]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/auth/getuser`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const user = await res.json();
        if (!cancelled && user?.username) {
          setUsername(user.username);
          setFrom(user.username);
        }
      } catch (e) {
        console.log(e)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handler = async () => {
    setError(null);
    setResponse(null);

    let data = {
      referrer_username: from,
      referee_username: to,
      contact_name: contactName,
      description: referralDetails,
      referral_type: referralType,
      referral_status: referralStatus,
      contact_phone: phone,
      contact_email: email,
      contact_address: address,
      comments: comments,
      hot: heatScale,
      created_at: date,
      status: false
    };

    data = sanitizeReferralData(data);

    if (!data.referrer_username || !data.referee_username || !data.description) {
      setError("Please fill in all required fields (*).");
      return;
    }
    if (data.referral_type === "tier2" && !data.contact_name) {
      setError("Contact Name is required for Tier 2 referrals.");
      return;
    }

    try {
      setLoading(true);

      const notificationData = {
        receiver: data.referee_username,
        sender: data.referrer_username,
        header: `🚀 Awesome! You received a new Referral from ${data.referrer_username}`,
        content: `Great news! ${data.referrer_username} has sent a new business referral your way.\n\nDetails: ${data.description}\n\nFollow up quickly and turn this into a win!`,
        read: false,
        data: {
          action: "OPEN_TYB",
          referrerName: data.referrer_username
        }
      };

      await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createnotification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notificationData),
          credentials: "include",
        }
      );

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/slips/referral/createreferral`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      const result = await res.json();

      if (result?.errors || result?.message === "error" || result?.error) {
        const errMsg =
          result?.errors?.[0]
            ? `${result?.errors?.[0].path} : ${result?.errors?.[0].msg}`
            : result?.message || result?.error || "An error occurred.";
        setError(String(errMsg));
      } else {
        const okText =
          typeof result === "string"
            ? result
            : result?.message || "Referral created successfully.";
        setResponse(okText);
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      setError(err?.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-2 sm:p-4 min-h-screen bg-stone-50/50 dark:bg-black/20">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-100 dark:border-gray-800 flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-gray-800 dark:to-gray-900 p-5 sm:p-8 flex justify-between items-center border-b border-amber-100 dark:border-gray-800 shrink-0">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
              <Handshake size={24} className="sm:w-7 sm:h-7" />
            </span>
            SIB Referral Slip
          </h2>
          <button
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
          
          {/* Section 1: The Basics */}
          <section className="space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-4">
              <User size={16} className="text-amber-500" />
              Who & When
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1">
                 <EntryField
                  type="date"
                  placeholder={todaysDate}
                  label="Date *"
                  value={date}
                  onChange={setDate}
                />
              </div>
              <div className="space-y-1">
                 <EntryField
                  type="text"
                  placeholder={username || "Loading..."}
                  label="From *"
                  value={from}
                  readOnly={true}
                  onChange={() => { }}
                />
              </div>
            </div>
            <div className="pt-2">
               <CrossChapterSearch
                label="To *"
                placeholder="Search Member Username..."
                value={to}
                onChange={setTo}
                userstate={setUserData}
              />
            </div>
          </section>

          {/* Section 2: The Referral */}
          <section className="bg-stone-50 dark:bg-gray-800/30 p-4 sm:p-6 rounded-2xl border border-stone-100 dark:border-gray-800 space-y-5">
             <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              Referral Details
            </h3>
            
            <TextArea
              label="Description *"
              placeholder="What is this referral about?"
              onChange={setReferralDetails}
              className="bg-white dark:bg-gray-900"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <RadioButtons
                label="Referral Type *"
                buttons={[
                  { name: "Tier 1 (Inside)", value: "tier1" },
                  { name: "Tier 2 (Outside)", value: "tier2" },
                ]}
                value={referralType}
                onChange={setReferralType}
              />
              <div className="flex flex-col justify-end">
                {referralType === "tier2" && (
                  <EntryField
                    type="text"
                    placeholder="Enter Contact Name"
                    label="Contact Name *"
                    value={contactName}
                    onChange={setContactName}
                  />
                )}
              </div>
            </div>

            <SelectButtons
              label="Status"
              items={[
                { name: "Given Your Card", value: "given_card" },
                { name: "Told Them You Would Call", value: "told_to_call" },
              ]}
              value={referralStatus}
              onChange={setReferralStatus}
            />
          </section>

          {/* Section 3: Contact Info */}
          <section className="space-y-4">
             <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-4">
              <Phone size={16} className="text-amber-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center">
                   <label className="text-sm font-medium text-gray-900 dark:text-gray-200 text-nowrap">
                     Telephone *
                   </label>
                    <button
                       type="button"
                       onClick={() => {
                          console.log("ReferalSlip: Phonebook button clicked");
                          setIsPickerOpen(true);
                       }}
                       className="text-xs flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md transition-colors active:scale-95"
                    >
                       <Phone size={12} /> Phonebook
                    </button>
                </div>
                <input
                  type="tel"
                  value={phone}
                  placeholder="Phone Number"
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
              <EntryField
                type="email"
                placeholder="Email Address"
                label="Email"
                value={email}
                onChange={setEmail}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
               <TextArea
                label="Address"
                placeholder="Physical address..."
                value={address}
                onChange={setAddress}
              />
               <TextArea
                label="Comments"
                placeholder="Any additional notes..."
                value={comments}
                onChange={setComments}
              />
            </div>
          </section>

          {/* Heat Scale - Centerpiece */}
          <div className="flex flex-col items-center justify-center pt-2 pb-4 border-t border-gray-100 dark:border-gray-800">
             <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">How hot is this lead?</span>
             <HeatScale value={heatScale} onChange={setHeatScale} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 text-center animate-pulse">
              {String(error)}
            </div>
          )}

          {response && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 text-center">
              {String(response)}
            </div>
          )}

          <div className="flex w-full justify-end gap-3 sm:gap-4">
            <FilterButton
              content="Cancel"
              bg="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              hover="hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-8 py-3 text-gray-600 dark:text-gray-300 shadow-sm"
            />
            <FilterButton
              content={loading ? "Sending..." : "Submit Referral"}
              bg="bg-gradient-to-r from-amber-400 to-yellow-500 dark:from-amber-600 dark:to-yellow-600"
              hover="hover:from-amber-500 hover:to-yellow-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              onClick={handler}
              loading={loading}
              className="flex-1 sm:flex-none px-4 sm:px-8 py-3 text-white font-semibold transform transition hover:-translate-y-0.5"
            />
          </div>
        </div>
 
        <ContactPicker
           isOpen={isPickerOpen}
           onClose={() => setIsPickerOpen(false)}
           onSelect={(contact) => {
              setPhone(contact.phone.replace(/[^0-9]/g, ''));
              if (referralType === 'tier2') {
                 setContactName(contact.name);
              }
              setIsPickerOpen(false);
           }}
        />
      </div>
    </div>
  );
}

export default ButtonPage;