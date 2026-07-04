import { useState, useEffect } from "react";
import CrossChapterSearch from "../Components/CrossSearch";
import EntryField from "../Components/EntryField";
import RadioButtons from "../Components/RadioButtons";
import TextArea from "../Components/TextArea";
import FilterButton from "../Members/Components/FilterButton";
import { getDate } from "../utils/getDate.mjs";
import { X, IndianRupee, Calendar, Briefcase, FileText, User, Layers } from "lucide-react";

function ButtonPage({ onClose = () => { }, prefillTo = "" }) {
  const todaysDate = getDate();
  const [date, setDate] = useState(todaysDate);
  const [amount, setAmount] = useState("");
  const [businessType, setBusinessType] = useState("new");
  const [referralType, setReferralType] = useState("tier1");
  const [comments, setComments] = useState("");
  const [to, setTo] = useState(prefillTo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [chapterName, setChapterName] = useState("loading..");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/getchapteroverview`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!cancelled && data?.chapterName) {
          setChapterName(data.chapterName);
        }
      } catch (e) {
        console.log(e)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    if (!to) {
      setError("Please select a recipient (Thank you to).");
      return;
    }
    const amt = Number(amount);
    if (!amount || Number.isNaN(amt) || amt <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!comments?.trim()) {
      setError("Please provide a business description.");
      return;
    }

    const data = {
      receiver_displayname: to,
      business_type: businessType,
      referral_type: referralType,
      business_amount: amt,
      business_description: comments.trim(),
      created_at: date,
      status: false
    };

    try {
      setLoading(true);

      const userRes = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/auth/getuser`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const getuser = await userRes.json();

      const notificationData = {
        receiver: data.receiver_displayname,
        sender: getuser?.username ?? "",
        header: `💸 Thank You for the Business (TYB) from ${(getuser?.username ?? "").toString()}!`,
        content: `Amazing job! ${(getuser?.username ?? "").toString()} just logged a TYB slip for your referral.\n\nAmount Generated: ₹${data.business_amount}\nNote: ${data.business_description}\n\nKeep up the great work!`,
        read: false
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
        `${import.meta.env.VITE_BACKEND_SERVER}/slips/tyftb/createtyftb`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );
      const result = await res.json();

      if (result?.errors || result?.message === "error" || result?.error) {
        const errMsg = result?.errors?.[0]
          ? `${result?.errors?.[0].path} : ${result?.errors?.[0].msg}`
          : (result?.message || result?.error || "An error occurred.");
        setError(String(errMsg));
      } else {
        const okText =
          typeof result === "string"
            ? result
            : result?.message || "TYB submitted successfully.";
        setResponse(String(okText));
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      setError(err?.message ? String(err.message) : "Network error.");
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
              <IndianRupee size={24} className="sm:w-7 sm:h-7" />
            </span>
            SIB TYB Slip
          </h2>
          <button
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-64 sm:p-8 sm:pb-8 space-y-6 sm:space-y-8 custom-scrollbar">
          
          {/* Section 1: Who & When */}
          <section className="space-y-4">
             <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-4">
              <Calendar size={16} className="text-amber-500" />
              Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
               <EntryField
                type="text"
                placeholder={chapterName || "Chapter"}
                label="Chapter"
                value={chapterName}
                readOnly={true}
                className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              <EntryField
                type="date"
                placeholder={todaysDate}
                label="Date"
                value={date}
                onChange={setDate}
                className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
            </div>
          </section>

          {/* Section 2: Transaction */}
          <section className="bg-stone-50 dark:bg-gray-800/30 p-4 sm:p-6 rounded-2xl border border-stone-100 dark:border-gray-800 space-y-5">
             <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-amber-500" />
              Transaction Information
            </h3>
            
            <CrossChapterSearch
              label="Thank you to *"
              placeholder="Select a member"
              value={to}
              onChange={setTo}
              className="dark:bg-gray-700 dark:text-gray-100 dark:border-yellow-400"
            />

            <EntryField
              type="number"
              placeholder="Enter Amount in INR"
              label="Amount (₹) *"
              value={amount}
              onChange={setAmount}
              className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 text-lg font-medium"
            />
          </section>

          {/* Section 3: Classifications & Notes */}
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-2">
                 <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Briefcase size={16} className="text-amber-500" />
                  Business Type
                </h3>
                <RadioButtons
                  label=""
                  buttons={[
                    { name: "New", value: "new" },
                    { name: "Repeat", value: "repeat" },
                  ]}
                  value={businessType}
                  onChange={setBusinessType}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Layers size={16} className="text-amber-500" />
                  Referral Type
                </h3>
                <RadioButtons
                  label=""
                  buttons={[
                    { name: "Tier 1", value: "tier1" },
                    { name: "Tier 2", value: "tier2" },
                    { name: "Tier 3+", value: "tier3" },
                  ]}
                  value={referralType}
                  onChange={setReferralType}
                />
              </div>
            </div>

            <div className="pt-2">
               <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-amber-500" />
                  Description
                </h3>
              <TextArea
                label="Business Description *"
                placeholder="Details about the business transacted..."
                value={comments}
                onChange={setComments}
                className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
            </div>
          </section>
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
              content={loading ? "Submitting..." : "Submit TYB"}
              bg="bg-gradient-to-r from-amber-400 to-yellow-500 dark:from-amber-600 dark:to-yellow-600"
              hover="hover:from-amber-500 hover:to-yellow-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              loading={loading}
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-4 sm:px-8 py-3 text-white font-semibold transform transition hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ButtonPage;