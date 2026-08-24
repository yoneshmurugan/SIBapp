import { useState, useEffect } from "react";
import { 
  Search, 
  ShieldCheck, 
  ShieldOff, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  X,
  AlertTriangle,
  User,
  UserX,
  Edit2
} from "lucide-react";

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function PresidentRoleManagement({ chapterId = null }) {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [blockConfirm, setBlockConfirm] = useState(null);
  const [changeUsernameConfirm, setChangeUsernameConfirm] = useState(null);
  const [newUsername, setNewUsername] = useState("");

  // Fetch Members
  const fetchMembers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/getallmemberships?chapter_id=${chapterId}`, {
        credentials: "include"
      });
      const data = await res.json();
      
      const formattedData = Array.isArray(data)
        ? data.map(item => ({
            id: item._id, // Membership ID
            userId: item.user?._id,
            name: item.user?.username || "Unknown",
            email: item.user?.email || "",
            role: item.role ? capitalize(item.role) : "Member",
            isPresident: /president/i.test(item.role || ""),
            isSuspended: item.membership_status === false || item.membership_status === 0,
            avatar: item.user?.avatar
          }))
        : [];
        
      setMembers(formattedData);
    } catch {
      setMessage({ type: "error", text: "Could not fetch members. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Selection Logic
  const handleSelect = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === filteredMembers.length) {
      setSelected([]);
    } else {
      setSelected(filteredMembers.map(m => m.id));
    }
  };

  // Bulk Role Update Logic
  const handleUpdateRole = async (newRole) => {
    setSaving(true);
    setMessage(null);
    const isPromoting = newRole.toLowerCase() === "president";
    
      
  const initiateChangeUsername = (userId, currentName, e) => {
    if (e) e.stopPropagation();
    setChangeUsernameConfirm({ id: userId, currentName });
    setNewUsername(currentName);
  };

  const confirmChangeUsername = async () => {
    if (!changeUsernameConfirm || !newUsername.trim()) return;
    if (newUsername.trim() === changeUsernameConfirm.currentName) {
      setChangeUsernameConfirm(null);
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/admin/change-username`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: changeUsernameConfirm.id, new_username: newUsername.trim() }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update username");

      setMembers(prev => prev.map(m => 
        m.userId === changeUsernameConfirm.id ? { ...m, name: newUsername.trim() } : m
      ));
      setMessage({ type: "success", text: "Username updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update username. Please try again." });
    } finally {
      setSaving(false);
      setChangeUsernameConfirm(null);
    }
  };

  // Filter members that actually need updating
    const membersToUpdate = members.filter(m => 
      selected.includes(m.id) && 
      (isPromoting ? !m.isPresident : m.role !== "Member")
    );

    if (membersToUpdate.length === 0) {
      setSaving(false);
      setSelected([]);
      setMessage({ type: "success", text: "No changes needed for selected members." });
      return;
    }

    try {
      await Promise.all(
        membersToUpdate.map(async (member) => {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/updatemembershipbyid/${member.id}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: newRole })
            }
          );
          if (!res.ok) throw new Error(`Failed to update ${member.name}`);
        })
      );

      // Optimistic Local Update
      setMembers(prev => prev.map(m => {
        if (membersToUpdate.find(u => u.id === m.id)) {
          return {
            ...m,
            role: capitalize(newRole),
            isPresident: isPromoting
          };
        }
        return m;
      }));

      setMessage({ 
        type: "success", 
        text: `Successfully ${isPromoting ? "promoted" : "demoted"} ${membersToUpdate.length} member(s).` 
      });
      setSelected([]);

    } catch {
      setMessage({ type: "error", text: "Failed to update some roles. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Delete Logic
  const initiateDelete = () => {
    if (selected.length === 0) return;
    const name = selected.length === 1 
      ? members.find(m => m.id === selected[0])?.name 
      : `${selected.length} members`;
      
    setDeleteConfirm({ count: selected.length, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    setMessage(null);
    
    try {
      await Promise.all(
        selected.map(async (id) => {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/admin/user?userId=${id}`,
            {
              method: "DELETE",
              credentials: "include"
            }
          );
          if (!res.ok) throw new Error("Failed to delete member");
        })
      );

      setMembers(prev => prev.filter(m => !selected.includes(m.id)));
      setMessage({ type: "success", text: "Member(s) deleted successfully." });
      setSelected([]);
    } catch {
      setMessage({ type: "error", text: "Failed to delete member(s). Please try again." });
    } finally {
      setSaving(false);
      setDeleteConfirm(null);
    }
  };

  // Filter

  const initiateBlock = () => {
    if (selected.length === 0) return;
    const name = selected.length === 1 
      ? members.find(m => m.id === selected[0])?.name 
      : `${selected.length} members`;
      
    const firstSelected = members.find(m => m.id === selected[0]);
    const isCurrentlySuspended = firstSelected?.isSuspended;

    setBlockConfirm({ count: selected.length, name, block: !isCurrentlySuspended });
  };

  const confirmBlock = async () => {
    if (!blockConfirm) return;
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/admin/blockuser`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selected, block: blockConfirm.block }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to block/unblock members");

      fetchMembers();
      setMessage({ type: "success", text: `Member(s) ${blockConfirm.block ? 'suspended' : 'reactivated'} successfully.` });
      setSelected([]);
    } catch {
      setMessage({ type: "error", text: "Failed to update member status. Please try again." });
    } finally {
      setSaving(false);
      setBlockConfirm(null);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.trim().toLowerCase()) ||
    m.email.toLowerCase().includes(search.trim().toLowerCase()) ||
    m.role.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 relative">
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirm Deletion</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Are you sure you want to completely remove <span className="font-semibold text-gray-900 dark:text-gray-200">{deleteConfirm.name}</span>? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm shadow-red-200 dark:shadow-none transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                <UserX size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirm {blockConfirm.block ? 'Suspension' : 'Reactivation'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Are you sure you want to {blockConfirm.block ? 'suspend' : 'reactivate'} <span className="font-semibold text-gray-900 dark:text-gray-200">{blockConfirm.name}</span>? 
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => setBlockConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmBlock}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                >
                  {blockConfirm.block ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Change Username Modal */}
      {changeUsernameConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Change Username</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Update the system username for this member. This will safely update their name on all past slips.
                </p>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setChangeUsernameConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmChangeUsername}
                  disabled={saving || !newUsername.trim() || newUsername.trim() === changeUsernameConfirm.currentName}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium shadow-sm transition-colors"
                >
                  {saving ? "Saving..." : "Update Name"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="text-emerald-500 shrink-0" />
            <span>Chapter Leadership</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage roles, assign President, and remove members.
          </p>
        </div>
        <button
          onClick={fetchMembers}
          disabled={loading || saving}
          className="self-start md:self-auto p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
          title="Refresh List"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-xl flex items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' 
            : 'bg-red-50 text-red-800 border border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 mt-0.5 sm:mt-0" /> : <AlertCircle size={20} className="shrink-0 mt-0.5 sm:mt-0" />}
          <span className="text-sm font-medium break-words flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="hover:opacity-75 p-1 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Controls & Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center sticky top-0 z-20 bg-white dark:bg-gray-900 py-2">
        {/* Search */}
        <div className="relative w-full lg:w-72 group">
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm"
          />
          <Search className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-wrap sm:flex-nowrap gap-2 transition-all duration-300 ${selected.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <button
            onClick={() => handleUpdateRole('president')}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
          >
            <ShieldCheck size={16} />
            <span className="hidden sm:inline">Make President</span>
            <span className="sm:hidden">Promote</span>
          </button>
          
          <button
            onClick={() => handleUpdateRole('Member')}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 dark:hover:border-amber-800 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
          >
            <ShieldOff size={16} />
            <span className="hidden sm:inline">Revoke Role</span>
            <span className="sm:hidden">Revoke</span>
          </button>

          <button
            onClick={initiateBlock}
            disabled={saving}
            className="flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
            title="Suspend / Reactivate User"
          >
            <UserX size={16} />
          </button>
          <button
            onClick={initiateDelete}
            disabled={saving}
            className="flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm flex flex-col h-[60vh] sm:h-[500px]">
        <div className="overflow-y-auto flex-1 bg-white dark:bg-gray-900">
          
          {/* --- DESKTOP VIEW (Table) --- */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-sm">
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                <th className="p-4 w-12 text-center bg-gray-50 dark:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={filteredMembers.length > 0 && selected.length === filteredMembers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    disabled={loading}
                  />
                </th>
                <th className="p-4 bg-gray-50 dark:bg-gray-800">Member</th>
                <th className="p-4 bg-gray-50 dark:bg-gray-800">Current Role</th>
                <th className="p-4 text-center bg-gray-50 dark:bg-gray-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-emerald-500" size={24} />
                      <span className="text-sm font-medium">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    <p className="text-sm">No members found.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => (
                  <tr 
                    key={member.id} 
                    className={`group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      selected.includes(member.id) ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(member.id)}
                        onChange={() => handleSelect(member.id)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        disabled={saving}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          member.isSuspended ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : member.isPresident ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px] lg:max-w-xs">{member.name}</p>
                              <button onClick={(e) => initiateChangeUsername(member.userId, member.name, e)} className="text-gray-400 hover:text-emerald-500 transition-colors p-1" title="Change Username">
                                <Edit2 size={14} />
                              </button>
                            </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] lg:max-w-xs">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isPresident
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {member.isSuspended && (
                        <div className="flex justify-center mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                            Suspended
                          </span>
                        </div>
                      )}
                      {member.isPresident && (
                        <div className="flex justify-center">
                          <ShieldCheck className="text-emerald-500 drop-shadow-sm" size={20} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* --- MOBILE VIEW (List Cards) --- */}
          <div className="md:hidden">
            {/* Mobile Select All Header */}
            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={filteredMembers.length > 0 && selected.length === filteredMembers.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                disabled={loading}
              />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {selected.length > 0 ? `${selected.length} Selected` : 'Select All'}
              </span>
            </div>

            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
                <RefreshCw className="animate-spin text-emerald-500" size={24} />
                <span className="text-sm">Loading members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                No members found matching your search.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredMembers.map(member => (
                  <div 
                    key={member.id} 
                    className={`p-4 flex gap-3 transition-colors active:bg-gray-50 dark:active:bg-gray-800 ${
                      selected.includes(member.id) ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''
                    }`}
                    onClick={(e) => {
                       // Allow clicking anywhere on card to select, unless clicking a button
                       if (e.target.type !== 'checkbox') {
                         handleSelect(member.id);
                       }
                    }}
                  >
                    <div className="pt-1 shrink-0">
                      <input
                        type="checkbox"
                        checked={selected.includes(member.id)}
                        onChange={() => handleSelect(member.id)}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        disabled={saving}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            member.isSuspended ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : member.isPresident ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{member.name}</p>
                              <button onClick={(e) => initiateChangeUsername(member.userId, member.name, e)} className="text-gray-400 hover:text-emerald-500 transition-colors p-1" title="Change Username">
                                <Edit2 size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {member.isSuspended && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                              Suspended
                            </span>
                          )}
                          {member.isPresident && (
                            <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pl-12">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${
                          member.isPresident
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer / Count */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
          <span>{filteredMembers.length} member{filteredMembers.length !== 1 && 's'}</span>
          <span>
            {selected.length > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selected.length} selected</span>
            ) : 'Select to edit'}
          </span>
        </div>
      </div>
    </div>
  );
}
