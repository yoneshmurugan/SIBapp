import { useState, useEffect } from "react";
import { HiSearch } from "react-icons/hi";

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function MemberRoleManagement() {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembers();
    async function fetchMembers() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/getallmemberships`, {
          credentials: "include"
        });
        const data = await res.json();
        setMembers(
          Array.isArray(data)
            ? data.map(item => ({
                id: item._id,
                membership_id: item._id,
                name: item.user?.username || "Unknown",
                email: item.user?.email || "",
                role: item.role ? capitalize(item.role) : "Member",
                originalRole: item.role ? capitalize(item.role) : "Member",
                isCoordinator: /coordinator/i.test(item.role || ""),
                chapter_id: item.chapter?._id,
                user_id: item.user?._id
              }))
            : []
        );
      } catch (err) {
        setError("Could not fetch members.");
      } finally {
        setLoading(false);
      }
    }
  }, []);

  function handleSelect(id) {
    setSelected(s =>
      s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );
  }

  function handleSelectAll() {
    if (selected.length === filteredMembers.length) {
      setSelected([]);
    } else {
      setSelected(filteredMembers.map(m => m.id));
    }
  }

  async function handleSetCoordinator() {
    setSaving(true);
    setError("");
    try {
      const toUpdate = members
        .filter(m => selected.includes(m.id) && m.role !== "coordinator")
        .map(m => ({ id: m.membership_id, newRole: "coordinator" }));
      await Promise.all(
        toUpdate.map(async ({ id }) => {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/updatemembershipbyid/${id}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: "coordinator",
              })
            }
          );
          if (!res.ok) {
            throw new Error("Failed updating at least one member");
          }
        })
      );
      setMembers(members =>
        members.map(m =>
          selected.includes(m.id)
            ? { ...m, role: "coordinator", isCoordinator: true }
            : m
        )
      );
      setSelected([]);
    } catch (err) {
      setError("Failed to set coordinator role for some members.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveCoordinator() {
    setSaving(true);
    setError("");
    try {
      const toUpdate = members
        .filter(m => selected.includes(m.id) && m.role === "coordinator")
        .map(m => ({ id: m.membership_id, newRole: "Member" }));
      await Promise.all(
        toUpdate.map(async ({ id }) => {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/updatemembershipbyid/${id}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: "Member"
              })
            }
          );
          if (!res.ok) {
            throw new Error("Failed updating at least one member");
          }
        })
      );
      setMembers(members =>
        members.map(m =>
          selected.includes(m.id)
            ? { ...m, role: "Member", isCoordinator: false }
            : m
        )
      );
      setSelected([]);
    } catch (err) {
      setError("Failed to remove coordinator role for some members.");
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    setSelected([]);
    setSearch("");
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.trim().toLowerCase()) ||
    m.email.toLowerCase().includes(search.trim().toLowerCase()) ||
    m.role.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="max-w-2xl h-[730px] mx-auto rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8 flex flex-col">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-50">
        Member Role Management
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 text-sm font-semibold text-center">
          {error}
        </div>
      )}

      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Member"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-400"
            disabled={saving || loading}
          />
          <HiSearch className="absolute left-2 top-3 text-gray-400 dark:text-gray-500" size={18} />
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4 mb-4">
        <button
          type="button"
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          onClick={handleClear}
          disabled={saving || loading}
        >
          Clear
        </button>
        <button
          type="button"
          className="bg-amber-300 hover:bg-amber-400 text-gray-900 font-semibold border border-amber-300 dark:border-amber-500 dark:bg-amber-400 dark:hover:bg-amber-300 rounded-lg px-4 py-2 transition"
          onClick={handleSetCoordinator}
          disabled={selected.length === 0 || saving || loading}
        >
          Set Coordinator
        </button>
        <button
          type="button"
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          onClick={handleRemoveCoordinator}
          disabled={selected.length === 0 || saving || loading}
        >
          Remove Coordinator
        </button>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="text-gray-900 dark:text-gray-100 font-semibold bg-amber-50 dark:bg-amber-900 border-b border-amber-200 dark:border-amber-800">
              <th className="pl-4 pr-2 py-2">
                <input
                  type="checkbox"
                  checked={selected.length === filteredMembers.length && filteredMembers.length > 0}
                  onChange={handleSelectAll}
                  className="accent-amber-400 rounded"
                  disabled={saving || loading}
                />
              </th>
              <th className="py-2 px-4">Username</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Coordinator</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading members...
                  </div>
                </td>
              </tr>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <tr
                  key={member.id}
                  className={`border-b border-gray-200 dark:border-gray-800 last:border-none`}
                >
                  <td className="pl-4 pr-2 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(member.id)}
                      onChange={() => handleSelect(member.id)}
                      className="accent-amber-400 rounded"
                      disabled={saving || loading}
                    />
                  </td>
                  <td className="py-2 px-4 font-medium text-gray-900 dark:text-gray-100">
                    {member.name}
                  </td>
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-300">
                    {member.role}
                  </td>
                  <td className="py-2 px-4">
                    {member.isCoordinator ? (
                      <span className="px-3 py-1 rounded-full bg-amber-300 text-xs font-bold text-gray-900 dark:bg-amber-400 dark:text-gray-900 select-none">
                        YES
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300 select-none">
                        NO
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No matching members found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
