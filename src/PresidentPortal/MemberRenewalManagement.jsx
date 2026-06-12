import React, { useState, useEffect } from "react";
import { HiArrowUp, HiArrowDown, HiCheck, HiX } from "react-icons/hi";

// MemberCard with Selection Checkbox
const MemberCard = ({ member, onSendReminder, loading, onrenewuser, selected, onToggleSelect }) => (
  <div 
    className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 mb-3 shadow-sm transition-all duration-200 
    ${selected 
      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-500/50' 
      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
    }`}
  >
    <div className="flex items-start gap-4 flex-1 mb-4 sm:mb-0">
      {/* Selection Checkbox */}
      <div className="pt-1">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(member.id)}
          className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
        />
      </div>

      <div className="flex-1">
        <div className="font-bold text-lg text-gray-900 dark:text-gray-50 flex items-center gap-2">
          {member.name}
          {selected && <span className="text-xs font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">Selected</span>}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Email: {member.email}
        </div>
        {member.phone && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
            Phone: {member.phone}
          </div>
        )}
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Due: {member.dueDate}
        </div>
        <div className={`italic text-xs mt-2 ${member.status === 'Overdue' ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-500'}`}>
          Status: {member.status}
        </div>
      </div>
    </div>

    <div className="pl-9 sm:pl-0 flex flex-wrap gap-2">
      <button
        onClick={() => onSendReminder(member)}
        disabled={loading}
        className="px-4 py-2 rounded-lg font-medium text-sm border border-amber-300 bg-amber-300 text-gray-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-grow sm:flex-grow-0"
      >
        {loading ? 'Sending...' : 'Remind'}
      </button>
      {member.phone && (
        <button
          onClick={() => {
            const msg = `⏳ Action Required: Membership Renewal\nHi ${member.name}! 👋\n\nYour SIB membership in the ${member.chapter} chapter is up for renewal on ${member.dueDate}. 📅\n\nDon't lose out on your exclusive network and benefits. Please complete your renewal soon to stay active! 🚀`;
            window.open(`https://wa.me/${member.phone}?text=${encodeURIComponent(msg)}`, '_blank');
          }}
          className="px-4 py-2 rounded-lg font-medium text-sm border border-green-500 bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 flex-grow sm:flex-grow-0"
        >
          WhatsApp
        </button>
      )}
      <button
        onClick={() => onrenewuser(member)}
        disabled={loading}
        className="px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-grow sm:flex-grow-0"
      >
        {loading ? 'Renewing...' : 'Renew'}
      </button>
    </div>
  </div>
);

const FilterButton = ({ label, value, isActive, onClick, isAlert }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg border font-medium transition-colors duration-200 whitespace-nowrap
      ${isActive
        ? isAlert
          ? 'border-red-400 bg-red-300 text-red-900 dark:bg-red-700 dark:border-red-500 dark:text-red-100'
          : 'border-amber-400 bg-amber-300 text-gray-900 dark:bg-amber-600 dark:border-amber-500 dark:text-gray-900'
        : isAlert
          ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900'
          : 'border-gray-300 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }
    `}
  >
    <span>{label}:</span>
    <span className="ml-2 font-bold">{value}</span>
  </button>
);

function getStatus(renewal, active) {
  if (!active) return "Inactive";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const renewDate = new Date(renewal);
  renewDate.setHours(0, 0, 0, 0);
  if (renewDate < now) return "Overdue";
  return "Pending notification";
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const MemberRenewalManagement = ({ refreshTrigger }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Single Renewal State
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [memberToRenew, setMemberToRenew] = useState(null);
  const [renewDate, setRenewDate] = useState("");

  // Bulk Renewal State
  const [selectedMembers, setSelectedMembers] = useState([]); // Array of IDs
  const [bulkRenewModalOpen, setBulkRenewModalOpen] = useState(false);
  const [bulkRenewDate, setBulkRenewDate] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [refreshTrigger]);

  // Clear selections when filter changes to avoid confusion
  useEffect(() => {
    setSelectedMembers([]);
  }, [activeFilter]);

  const fetchMembers = async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/getallmemberships`, {
        credentials: "include",
        method: "GET"
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load memberships");
      }
      const list = await res.json();
      setMembers(list.map(m => ({
        id: m._id,
        name: m.user?.username || "Unknown",
        userId: m.user?._id,
        email: m.user?.email || "N/A",
        phone: m.user?.phone_number || "",
        dueDate: formatDate(m.renewal_date),
        rawDueDate: m.renewal_date,
        status: getStatus(m.renewal_date, m.membership_status),
        chapter: m.chapter?.chapter_name || "",
        membershipStatus: m.membership_status,
      })));
    } catch (err) {
      setError(err.message || "Failed to fetch members");
    } finally {
      setFetching(false);
    }
  };

  const getFilteredMembers = () => {
    const now = new Date();
    const today = getStartOfDay(now);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let filtered = members;

    if (activeFilter === "thisMonth") {
      filtered = members.filter(m => {
        if (m.status !== "Pending notification" && m.status !== "Overdue") return false;
        if (!m.rawDueDate) return false;
        const dueDate = getStartOfDay(new Date(m.rawDueDate));
        return dueDate >= startOfMonth && dueDate <= endOfMonth;
      });
    } else if (activeFilter === "thisWeek") {
      filtered = members.filter(m => {
        if (m.status !== "Pending notification" && m.status !== "Overdue") return false;
        if (!m.rawDueDate) return false;
        const dueDate = getStartOfDay(new Date(m.rawDueDate));
        return dueDate >= today && dueDate <= endOfWeek;
      });
    } else if (activeFilter === "overdue") {
      filtered = members.filter(m => m.status === "Overdue");
    }

    return sortMembers(filtered);
  };

  const sortMembers = (membersToSort) => {
    const sorted = [...membersToSort];
    sorted.sort((a, b) => {
      let compareA, compareB;

      if (sortBy === "name") {
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      } else if (sortBy === "dueDate") {
        compareA = new Date(a.rawDueDate || 0);
        compareB = new Date(b.rawDueDate || 0);
      } else if (sortBy === "status") {
        compareA = a.status.toLowerCase();
        compareB = b.status.toLowerCase();
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    return sorted;
  };

  /* --- SELECTION LOGIC --- */
  const handleToggleSelect = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) 
        ? prev.filter(mid => mid !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentList = getFilteredMembers();
    if (selectedMembers.length === currentList.length && currentList.length > 0) {
      // If all are selected, deselect all
      setSelectedMembers([]);
    } else {
      // Select all visible members
      setSelectedMembers(currentList.map(m => m.id));
    }
  };

  /* --- ACTIONS --- */

  const handleSendReminder = async (member) => {
    setSelectedReminder(member.id);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        receiver: member.name,
        header: `⏳ Action Required: Membership Renewal`,
        content: `Hi ${member.name}!\n\nYour SIB membership in the ${member.chapter} chapter is up for renewal on ${member.dueDate}.\n\nDon't lose out on your exclusive network and benefits. Please complete your renewal soon to stay active!`
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createnotificationwithoutsender`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reminder");
      }

      setSuccess(`Reminder sent to ${member.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to send reminder to ${member.name}: ${err.message}`);
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
      setSelectedReminder(null);
    }
  };

  // Single Renew
  const handleRenewUser = async (member) => {
    setRenewModalOpen(true);
    setMemberToRenew(member);
  };

  const handleRenewUserrequest = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        renewal_date: renewDate,
        membership_status : true
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/updatemembershipbyid/${memberToRenew.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      
      // Notify (Only for single renewal based on existing code)
      await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createnotificationwithoutsender`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiver: memberToRenew.name,
            header: `🎉 Membership Renewal Successful!`,
            content: `Hi ${memberToRenew.name}, great news!\n\nYour membership in ${memberToRenew.chapter} has been successfully renewed! Your new due date is ${renewDate}.\n\nThank you for being a valued member of the SIB family!`
          })
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to renew membership");
      }
      setSuccess(`Membership renewed for ${memberToRenew.name}`);
      fetchMembers(); // Refresh list to show updated dates
    }
    catch (err) {
      setError(`Failed to renew membership for ${memberToRenew.name}: ${err.message}`);
    }
    finally {
      setRenewModalOpen(false);
      setLoading(false);
      setMemberToRenew(null);
      setRenewDate("");
    }
  };

  // Bulk Renew
  const handleBulkRenewRequest = async () => {
    if (!bulkRenewDate) {
      setError("Please select a renewal date.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ids: selectedMembers,
        renewal_date: bulkRenewDate,
        membership_status: true
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/updatemembershipbyids`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update memberships");
      }

      setSuccess(`Successfully renewed ${selectedMembers.length} members.`);
      setSelectedMembers([]); // Clear selection
      setBulkRenewDate("");
      setBulkRenewModalOpen(false);
      fetchMembers(); // Refresh Data
      
    } catch (err) {
      setError(`Bulk renewal failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSendReminders = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const currentList = getFilteredMembers();

      if (currentList.length === 0) {
        setError("No members to send reminders to");
        return;
      }

      let sentCount = 0;
      let failedCount = 0;

      for (let member of currentList) {
        try {
          const payload = {
            receiver: member.name,
            header: `⏳ Action Required: Membership Renewal`,
            content: `Hi ${member.name}!\n\nYour SIB membership in the ${member.chapter} chapter is up for renewal on ${member.dueDate}.\n\nDon't lose out on your exclusive network and benefits. Please complete your renewal soon to stay active!`
          };

          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/notification/createnotificationwithoutsender`,
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            }
          );

          if (res.ok) {
            sentCount += 1;
          } else {
            failedCount += 1;
          }
        } catch (err) {
          failedCount += 1;
        }
      }

      if (sentCount > 0) {
        setSuccess(`Reminders sent to ${sentCount} member(s)${failedCount > 0 ? ` (${failedCount} failed)` : ''}`);
      } else {
        setError("Failed to send reminders to any members");
      }

      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError("Failed to process bulk reminders");
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleExportList = () => {
    try {
      const visibleMembers = getFilteredMembers();

      if (visibleMembers.length === 0) {
        setError("No members to export");
        return;
      }

      const csvContent = [
        ["Name", "Email", "Due Date", "Status", "Chapter"],
        ...visibleMembers.map((m) => [m.name, m.email, m.dueDate, m.status, m.chapter]),
      ]
        .map((row) => row.map(cell => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `member_renewals_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Export completed successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to export list");
      setTimeout(() => setError(null), 3000);
    }
  };

  const now = new Date();
  const today = getStartOfDay(now);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const overdueCount = members.filter((m) => m.status === "Overdue").length;

  const dueThisMonthCount = members.filter((m) => {
    if (m.status !== "Pending notification" && m.status !== "Overdue") return false;
    if (!m.rawDueDate) return false;
    const dueDate = getStartOfDay(new Date(m.rawDueDate));
    return dueDate >= startOfMonth && dueDate <= endOfMonth;
  }).length;

  const dueThisWeekCount = members.filter((m) => {
    if (m.status !== "Pending notification" && m.status !== "Overdue") return false;
    if (!m.rawDueDate) return false;
    const dueDate = getStartOfDay(new Date(m.rawDueDate));
    return dueDate >= today && dueDate <= endOfWeek;
  }).length;

  const filteredMembers = getFilteredMembers();
  const allSelected = filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length;

  return (
    <div className="w-full rounded-2xl p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 relative">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50">
        Member Renewal Management
      </h2>

      {/* Stats / Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <FilterButton
          label="Due This Month"
          value={dueThisMonthCount}
          isActive={activeFilter === "thisMonth"}
          onClick={() =>
            setActiveFilter(activeFilter === "thisMonth" ? null : "thisMonth")
          }
          isAlert={false}
        />
        <FilterButton
          label="Due This Week"
          value={dueThisWeekCount}
          isActive={activeFilter === "thisWeek"}
          onClick={() =>
            setActiveFilter(activeFilter === "thisWeek" ? null : "thisWeek")
          }
          isAlert={false}
        />
        <FilterButton
          label="Overdue"
          value={overdueCount}
          isActive={activeFilter === "overdue"}
          onClick={() =>
            setActiveFilter(activeFilter === "overdue" ? null : "overdue")
          }
          isAlert={overdueCount > 0}
        />
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 px-2">
             <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              disabled={filteredMembers.length === 0}
              className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer disabled:opacity-50"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select All {filteredMembers.length > 0 && `(${filteredMembers.length})`}
            </span>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-1 focus:ring-amber-300"
            >
              <option value="name">Name</option>
              <option value="dueDate">Due Date</option>
              <option value="status">Status</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? <HiArrowUp /> : <HiArrowDown />}
          </button>
        </div>

        {activeFilter && (
          <button
            onClick={() => setActiveFilter(null)}
            className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 underline decoration-dotted"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Bulk Action Bar - Sticky when items selected */}
      {selectedMembers.length > 0 && (
        <div className="sticky top-2 z-10 mb-4 p-4 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {selectedMembers.length}
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">Members Selected</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button
              onClick={() => setSelectedMembers([])}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => setBulkRenewModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold shadow-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              <HiCheck className="w-4 h-4" />
              Renew Selected
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      
      {/* Single Renew Modal */}
      {renewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-50">Renew Membership</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Updating renewal date for <span className="font-semibold text-gray-900 dark:text-white">{memberToRenew?.name}</span>.
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Expiry Date</label>
            <input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-amber-300 focus:ring-amber-300" />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setRenewModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button onClick={handleRenewUserrequest} disabled={loading} className="px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-medium hover:bg-amber-500 disabled:opacity-50">
                {loading ? "Renewing..." : "Confirm Renewal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Renew Modal */}
      {bulkRenewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">Bulk Renewal</h3>
              <button onClick={() => setBulkRenewModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"><HiX className="w-5 h-5"/></button>
            </div>
            
            <div className="p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                You are about to renew membership for <strong>{selectedMembers.length} users</strong>.
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select New Renewal Date</label>
            <input 
              type="date" 
              value={bulkRenewDate} 
              onChange={(e) => setBulkRenewDate(e.target.value)} 
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-amber-300 focus:ring-amber-300" 
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setBulkRenewModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkRenewRequest} 
                disabled={loading || !bulkRenewDate} 
                className="px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-bold hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Renew ${selectedMembers.length} Members`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {fetching && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg animate-pulse">
          <p className="text-sm text-blue-700 dark:text-blue-200">Loading members...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-200 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-200 font-medium">{success}</p>
        </div>
      )}

      {/* Member List */}
      <div className="mb-6 max-h-[500px] overflow-auto pr-1 custom-scrollbar">
        {filteredMembers.length > 0 ? (
          <div>
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                selected={selectedMembers.includes(member.id)}
                onToggleSelect={handleToggleSelect}
                onSendReminder={handleSendReminder}
                onrenewuser={handleRenewUser}
                loading={loading && selectedReminder === member.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <p className="text-gray-600 dark:text-gray-400">
              {activeFilter ? "No members match this filter" : "No members found"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
        <button
          onClick={handleAutoSendReminders}
          disabled={loading || filteredMembers.length === 0 || fetching}
          className="w-full px-4 py-3 rounded-lg border border-amber-300 font-medium bg-amber-300 text-gray-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
        >
          {loading ? "Sending..." : `Auto-Send Reminders (${filteredMembers.length})`}
        </button>

        <button
          onClick={handleExportList}
          disabled={loading || filteredMembers.length === 0 || fetching}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
        >
          Export List ({filteredMembers.length})
        </button>
      </div>
    </div>
  );
};

export default MemberRenewalManagement;