import React, { useState, useEffect } from 'react';
import useFetch from '../hooks/useFetch';
import { ArrowRightLeft, Search, User, Check, X, AlertTriangle } from 'lucide-react';

export default function TransferChapterAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetChapterId, setTargetChapterId] = useState("");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch all users for search
  const { data: usersData, loading: usersLoading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/admin/members-search`,
    { method: "GET", credentials: "include" }
  );

  // Fetch all chapters for dropdown
  const { data: chaptersData } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/chapter/main/getallchapters`,
    { method: "GET", credentials: "include" }
  );

  const users = usersData || [];
  const chapters = chaptersData || [];

  const filteredUsers = search.length > 2 
    ? users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleTransfer = async () => {
    if (!selectedUser || !targetChapterId) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/admin/transfer-chapter`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: selectedUser.user_id,
          targetChapterId: targetChapterId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");

      setMessage({ type: "success", text: "Successfully transferred member!" });
      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    setSearch("");
    setSelectedUser(null);
    setTargetChapterId("");
    setMessage(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ArrowRightLeft className="text-emerald-500" size={20} />
              Admin Actions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Move members between chapters securely.</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-80 transition-opacity"
          >
            Transfer Chapter
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="text-emerald-500" size={20} />
                Transfer Member to New Chapter
              </h3>
              <button onClick={() => { setIsOpen(false); resetState(); }} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {message && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                  {message.type === 'error' ? <AlertTriangle size={18} className="shrink-0 mt-0.5" /> : <Check size={18} className="shrink-0 mt-0.5" />}
                  <p>{message.text}</p>
                </div>
              )}

              {!selectedUser ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search User</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Type at least 3 letters of username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {search.length > 2 && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No users found.</div>
                      ) : (
                        filteredUsers.map(u => (
                          <button
                            key={u._id}
                            onClick={() => setSelectedUser(u)}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-0 text-left transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{u.username}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{u.chapter_name} • {u.role}</div>
                            </div>
                            {u.status === false && (
                              <span className="text-[10px] uppercase font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">Suspended</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{selectedUser.username}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">Current: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedUser.chapter_name}</span></p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline shrink-0">Change</button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Target Chapter</label>
                    <select
                      value={targetChapterId}
                      onChange={(e) => setTargetChapterId(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    >
                      <option value="">-- Choose Chapter --</option>
                      {chapters.filter(c => c._id !== selectedUser.chapter_id).map(c => (
                        <option key={c._id} value={c._id}>{c.chapter_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-3 flex gap-3 text-sm text-yellow-800 dark:text-yellow-400">
                    <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1">
                      <p className="font-semibold">Transfer Data Safety</p>
                      <ul className="list-disc pl-4 space-y-1 text-yellow-700 dark:text-yellow-500 text-xs">
                        <li>User's role will be safely reset to <strong>Member</strong>.</li>
                        <li>Historical stats will remain in <strong>{selectedUser.chapter_name}</strong>.</li>
                        <li>New stats will accrue in the selected chapter.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
              <button
                type="button"
                onClick={() => { setIsOpen(false); resetState(); }}
                disabled={saving}
                className="flex-1 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedUser || !targetChapterId || saving}
                onClick={handleTransfer}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? "Transferring..." : "Transfer Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
