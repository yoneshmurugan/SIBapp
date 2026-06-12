import { useState, useMemo, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const TABLE_COLUMNS = [
  { key: 'name', label: ' ↑↓ MEMBER NAME', sortable: true, width: 'flex-1 min-w-[150px]' },
  { key: 'attendance', label: '↑↓ CURRENT ATTENDANCE %', sortable: true, width: 'w-32' },
  { key: 'trend', label: 'TREND', sortable: false, width: 'w-16' },
  { key: 'lastPresent', label: '↑↓ LAST PRESENT DATE', sortable: true, width: 'w-32' },
  { key: 'contact', label: 'CONTACT INFORMATION', sortable: false, width: 'w-40' },
  { key: 'actions', label: 'ACTIONS', sortable: false, width: 'w-52' },
];

const ATTENDANCE_THRESHOLD = 75;

const LowAttendanceAlert = () => {
  const [members, setMembers] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'attendance', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchAttendance() {
      setFetchLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/meeting/attendance/getallattendances`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch attendance');
        const data = await res.json();
        processAttendanceData(data);
      } catch (err) {
        console.log(err);
        setError(err.message);
      } finally {
        setFetchLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  function processAttendanceData(data) {
    try {
      if (!Array.isArray(data)) throw new Error('Attendance data is not an array');
      const userMap = {};
      data.forEach(record => {
        if (!record || !record.user || !record.user._id) return;
        const userId = record.user._id;
        if (!userMap[userId]) {
          userMap[userId] = {
            id: userId,
            name: record.user.username || 'Unknown',
            contact: record.user.phone_number || '',
            totalMeetings: 0,
            presentCount: 0,
            lastPresentDate: null,
          };
        }
        userMap[userId].totalMeetings++;
        if (record.attendance_status === 'present') {
          userMap[userId].presentCount++;
          const recordDate = new Date(record.date);
          if (!userMap[userId].lastPresentDate || recordDate > new Date(userMap[userId].lastPresentDate)) {
            userMap[userId].lastPresentDate = record.date;
          }
        }
      });
      const processedMembers = Object.values(userMap).map(user => ({
        ...user,
        attendance: user.totalMeetings > 0 ? Math.round((user.presentCount / user.totalMeetings) * 100) : 0,
        trend: user.attendance < 75 ? 'down' : 'up',
        lastPresent: user.lastPresentDate
          ? new Date(user.lastPresentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A'
      }));
      setMembers(processedMembers);
    } catch (err) {
      setError(err.message || 'Error processing attendance data');
    }
  }

  const lowAttendanceMembers = useMemo(() => {
    return members.filter(m => m.attendance < ATTENDANCE_THRESHOLD);
  }, [members]);

  const filteredAndSortedData = useMemo(() => {
    let result = lowAttendanceMembers.filter(
      row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.contact.includes(searchTerm)
    );
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      let comparison = 0;
      if (typeof aValue === 'string') {
        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [lowAttendanceMembers, searchTerm, sortConfig]);

  const criticalCount = lowAttendanceMembers.filter(m => m.attendance < 60).length;

  const handleSelectAll = checked => {
    if (checked) {
      setSelectedRows(new Set(filteredAndSortedData.map(m => m.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = id => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSort = columnKey => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSendAlert = async (ids = null) => {
    setLoading(true);
    try {
      const targetIds = ids || Array.from(selectedRows);
      const targetMembers = members.filter(m => targetIds.includes(m.id));
      for (const member of targetMembers) {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/notification/createnotificationwithoutsender`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receiver: member.name,
              header: `⚠️ Action Required: Low Attendance Alert`,
              content: `Hi ${member.name}, we've noticed your attendance is currently at ${member.attendance}%.\n\nYour presence is vital to the chapter's success! Please make sure to attend upcoming meetings to stay active and avoid any penalties. We hope to see you soon!`,
            })
          });
          if (!res.ok) {
            throw new Error(`Failed to send alert to ${member.name}`);
          }
        } catch (err) {
          setError(err.message);
        }
      }
      setSuccess(`Alert sent to ${targetMembers.length} member(s)`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
        console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async userId => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/meeting/attendance/getattendanceofuser/${userId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch user attendance');
      let data = [];
      try {
        data = await res.json();
      } catch (err) {
        throw new Error('Failed to parse user attendance data');
      }
      setModalData(Array.isArray(data) ? data : []);
      setShowModal(true);
    } catch (err) {
        console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = phoneNumber => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleExportList = () => {
    setLoading(true);
    try {
      const csv = [
        ['MEMBER NAME', 'ATTENDANCE %', 'LAST PRESENT DATE', 'CONTACT INFORMATION'].join(','),
        ...filteredAndSortedData.map(row =>
          [row.name, row.attendance, row.lastPresent, row.contact].map(v => `"${v}"`).join(',')
        )
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `low-attendance-alert-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess('List exported successfully');
      setTimeout(() => setSuccess(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = percentage => {
    if (percentage >= 75) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrendIcon = trend => (trend === 'down' ? '▼' : '▲');
  const getTrendColor = trend => (trend === 'down' ? 'text-red-600' : 'text-green-600');

  if (fetchLoading) return <div className="w-full min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="w-full min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Low Attendance Alert</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Members Below {ATTENDANCE_THRESHOLD}% Threshold</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-1">Low Attendance Members</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{filteredAndSortedData.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-1">Critical (&lt;60%)</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{criticalCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-1">Average Attendance</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {filteredAndSortedData.length > 0
                ? (filteredAndSortedData.reduce((a, b) => a + b.attendance, 0) / filteredAndSortedData.length).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search Member or Phone</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Type member name or phone number..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-row w-full mt-3 gap-3 justify-end items-end">
              <button
                onClick={() => handleSendAlert()}
                disabled={selectedRows.size === 0 || loading}
                className="flex-1 max-h-10 px-6 py-3 rounded-lg font-bold text-sm bg-yellow-400 hover:bg-yellow-500 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                <p className="-mt-1 text-nowrap">Send Alert to Selected</p>
              </button>
              <button
                onClick={handleExportList}
                disabled={loading}
                className="flex-1 max-h-10 px-6 py-3 rounded-lg font-semibold text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300 dark:border-gray-600"
              >
                <p className="-mt-1">Export List</p>
              </button>
            </div>
          </div>
        </div>
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
          </div>
        )}
        <p className="text-gray-900 dark:text-gray-100 text-md mb-2">
          <span className="font-bold">Note*: </span>Fields with (↑↓) can be sorted in ascending or descending order.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-[600px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 sticky top-0 dark:bg-black border-b border-white dark:border-gray-700">
                  <th className="px-4 py-4 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </th>
                  {TABLE_COLUMNS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide ${col.width} ${
                        col.sortable ? 'cursor-pointer hover:bg-gray-800' : ''
                      } transition-colors`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-200 dark:border-gray-700 ${
                        idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                      } hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          className="rounded accent-blue-500 w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-gray-50">{row.name}</td>
                      <td className="px-4 py-4 text-sm font-bold">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getAttendanceColor(row.attendance)}`}>
                          {row.attendance}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-lg font-bold">
                        <span className={getTrendColor(row.trend)}>{getTrendIcon(row.trend)}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-50">{row.lastPresent}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-50 font-mono">{row.contact}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSendAlert([row.id])}
                              disabled={loading}
                              className="flex-1 px-3 py-1 rounded text-xs font-semibold bg-amber-300 hover:bg-amber-400 text-black disabled:opacity-50 transition-colors"
                            >
                              Send Alert
                            </button>
                            <button
                              onClick={() => {
                                  const msg = `⚠️ Action Required: Low Attendance Alert\nHi ${row.name}, we've noticed your attendance is currently at ${row.attendance}%. 📉\n\nYour presence is vital to the chapter's success! Please make sure to attend upcoming meetings to stay active and avoid any penalties. We hope to see you soon! 🤝`;
                                  window.open(`https://wa.me/${row.contact}?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              disabled={loading}
                              className="flex-1 px-3 py-1 rounded text-xs font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 transition-colors"
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleCall(row.contact)}
                              disabled={loading}
                              className="flex-1 px-3 py-1 rounded text-xs font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
                            >
                              Call
                            </button>
                          </div>
                          <button
                            className="w-full px-3 py-1 rounded text-xs font-semibold bg-gray-300 hover:bg-gray-400 text-gray-900 transition-colors"
                            onClick={() => handleViewHistory(row.id)}
                          >
                            View History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400 text-sm">
                      No members with low attendance found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Attendance History</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50">
                <HiX size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {Array.isArray(modalData) && modalData.length > 0 ? modalData.map((record, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Meeting: {record.meeting?.title || 'N/A'}</p>
                  <p className="text-sm text-gray-900 dark:text-gray-50">Date: {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-sm text-gray-900 dark:text-gray-50">Status: {record.attendance_status || 'N/A'}</p>
                  <p className="text-sm text-gray-900 dark:text-gray-50">Location: {record.meeting?.location || 'N/A'}</p>
                </div>
              )) : (
                <div className="text-gray-600 dark:text-gray-400">No attendance history found.</div>
              )}
            </div>
            <div className="flex gap-2 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowAttendanceAlert;
