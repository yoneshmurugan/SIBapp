import { useState, useEffect, useMemo } from "react";
import { HiSearch } from "react-icons/hi";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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
                isPresident: /president/i.test(item.role || ""),
                chapter_id: item.chapter?._id,
                user_id: item.user?._id,
                lastSignedIn: item.user?.last_signed_in
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
    const member = members.find(m => m.id === id);
    if (member?.isPresident) return;
    setSelected(s =>
      s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );
  }

  function handleSelectAll() {
    if (selected.length === selectableMembers.length && selectableMembers.length > 0) {
      setSelected([]);
    } else {
      setSelected(selectableMembers.map(m => m.id));
    }
  }

  async function handleSetCoordinator() {
    setSaving(true);
    setError("");
    try {
      const toUpdate = members
        .filter(m => selected.includes(m.id) && !m.isCoordinator && !m.isPresident)
        .map(m => ({ id: m.membership_id, newRole: "coordinator" }));

      if (toUpdate.length === 0) {
        setSelected([]);
        return;
      }

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

      const updatedIds = toUpdate.map(u => u.id);
      setMembers(members =>
        members.map(m =>
          updatedIds.includes(m.membership_id)
            ? { ...m, role: "Coordinator", isCoordinator: true }
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
        .filter(m => selected.includes(m.id) && (m.isCoordinator || /coordinator/i.test(m.role || "")) && !m.isPresident)
        .map(m => ({ id: m.membership_id, newRole: "Member" }));

      if (toUpdate.length === 0) {
        setSelected([]);
        return;
      }

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

      const updatedIds = toUpdate.map(u => u.id);
      setMembers(members =>
        members.map(m =>
          updatedIds.includes(m.membership_id)
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

  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  function handleSort(key) {
    setSortConfig(current => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc"
        };
      }
      return { key, direction: "asc" };
    });
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.trim().toLowerCase()) ||
    m.email.toLowerCase().includes(search.trim().toLowerCase()) ||
    m.role.toLowerCase().includes(search.trim().toLowerCase())
  );

  const sortedMembers = useMemo(() => {
    let result = [...filteredMembers];
    if (!sortConfig.key) return result;

    return result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "name" || sortConfig.key === "role") {
        aVal = (aVal || "").toString().toLowerCase();
        bVal = (bVal || "").toString().toLowerCase();
      } else if (sortConfig.key === "lastSignedIn") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sortConfig.key === "isCoordinator") {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredMembers, sortConfig]);

  const selectableMembers = sortedMembers.filter(m => !m.isPresident);

  return (
    <div className="max-w-2xl min-h-[500px] h-[calc(100dvh-130px)] sm:h-[730px] mx-auto rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-8 flex flex-col">
      <h2 className="text-xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-gray-900 dark:text-gray-50">
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
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-400"
            disabled={saving || loading}
          />
          <HiSearch className="absolute left-2.5 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
        <button
          type="button"
          className="flex-1 sm:flex-initial bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-lg px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
          onClick={handleClear}
          disabled={saving || loading}
        >
          Clear
        </button>
        <button
          type="button"
          className="flex-1 sm:flex-initial bg-amber-300 hover:bg-amber-400 text-gray-900 font-semibold border border-amber-300 dark:border-amber-500 dark:bg-amber-400 dark:hover:bg-amber-300 rounded-lg px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm transition cursor-pointer disabled:opacity-50"
          onClick={handleSetCoordinator}
          disabled={selected.length === 0 || saving || loading}
        >
          Set Coordinator
        </button>
        <button
          type="button"
          className="w-full sm:w-auto bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-lg px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
          onClick={handleRemoveCoordinator}
          disabled={selected.length === 0 || saving || loading}
        >
          Remove Coordinator
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left border-separate border-spacing-0 min-w-[540px]">
          <thead className="sticky top-0 z-10">
            <tr className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm font-semibold bg-amber-50 dark:bg-amber-900 border-b border-amber-200 dark:border-amber-800">
              <th className="pl-4 pr-2 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={selected.length === selectableMembers.length && selectableMembers.length > 0}
                  onChange={handleSelectAll}
                  className="accent-amber-400 rounded w-4 h-4 cursor-pointer"
                  disabled={saving || loading || selectableMembers.length === 0}
                />
              </th>
              <th
                onClick={() => handleSort("name")}
                className="py-2.5 px-3 cursor-pointer select-none hover:bg-amber-100 dark:hover:bg-amber-800/60 transition-colors"
                title="Sort by Username"
              >
                <div className="flex items-center gap-1.5">
                  <span>Username</span>
                  {sortConfig.key === "name" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
                    ) : (
                      <ArrowDown size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
                    )
                  ) : (
                    <ArrowUpDown size={14} className="text-gray-400 opacity-60 shrink-0" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("role")}
                className="py-2.5 px-3 cursor-pointer select-none hover:bg-amber-100 dark:hover:bg-amber-800/60 transition-colors"
                title="Sort by Role"
              >
                <div className="flex items-center gap-1.5">
                  <span>Role</span>
                  {sortConfig.key === "role" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
                    ) : (
                      <ArrowDown size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
                    )
                  ) : (
                    <ArrowUpDown size={14} className="text-gray-400 opacity-60 shrink-0" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("lastSignedIn")}
                className="py-2.5 px-3 cursor-pointer select-none hover:bg-amber-100 dark:hover:bg-amber-800/60 transition-colors"
                title="Sort by Last Signed In"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Signed In</span>
                  {sortConfig.key === "lastSignedIn" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
                    ) : (
                      <ArrowDown size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
                    )
                  ) : (
                    <ArrowUpDown size={14} className="text-gray-400 opacity-60 shrink-0" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("isCoordinator")}
                className="py-2.5 px-3 cursor-pointer select-none hover:bg-amber-100 dark:hover:bg-amber-800/60 transition-colors"
                title="Sort by Coordinator"
              >
                <div className="flex items-center gap-1.5">
                  <span>Coordinator</span>
                  {sortConfig.key === "isCoordinator" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
                    ) : (
                      <ArrowDown size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
                    )
                  ) : (
                    <ArrowUpDown size={14} className="text-gray-400 opacity-60 shrink-0" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading members...
                  </div>
                </td>
              </tr>
            ) : sortedMembers.length > 0 ? (
              sortedMembers.map(member => (
                <tr
                  key={member.id}
                  className={`border-b border-gray-200 dark:border-gray-800 last:border-none transition-colors ${
                    member.isPresident
                      ? "opacity-50 grayscale bg-gray-100/70 dark:bg-gray-800/50 cursor-not-allowed select-none"
                      : ""
                  }`}
                  title={member.isPresident ? "Presidents cannot be assigned as coordinator" : undefined}
                >
                  <td className="pl-4 pr-2 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(member.id)}
                      onChange={() => handleSelect(member.id)}
                      className="accent-amber-400 rounded w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                      disabled={saving || loading || member.isPresident}
                      title={member.isPresident ? "Presidents cannot be assigned as coordinator" : undefined}
                    />
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-gray-100">
                    {member.name}
                  </td>
                  <td className="py-2.5 px-3 text-gray-800 dark:text-gray-300">
                    {member.role}
                  </td>
                  <td className="py-2.5 px-3">
                    {member.lastSignedIn ? (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(member.lastSignedIn).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {member.isCoordinator ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-300 text-[11px] sm:text-xs font-bold text-gray-900 dark:bg-amber-400 dark:text-gray-900 select-none">
                        YES
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-gray-200 text-[11px] sm:text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300 select-none">
                        NO
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
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
