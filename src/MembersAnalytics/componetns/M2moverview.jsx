import { Delete } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { HiX } from 'react-icons/hi';

const TABLE_COLUMNS = [
  { key: 'member1', label: 'MEMBER 1', sortable: true, width: 'min-w-[120px]' },
  { key: 'member2', label: 'MEMBER 2', sortable: true, width: 'min-w-[120px]' },
  { key: 'meeting_date', label: 'MEETING DATE', sortable: true, width: 'w-32' },
  { key: 'location', label: 'LOCATION', sortable: true, width: 'min-w-[150px]' },
  { key: 'discussion_points', label: 'DISCUSSION POINTS', sortable: true, width: 'min-w-[200px]' },
  { key: 'created_by_user', label: 'CREATED BY', sortable: true, width: 'min-w-[120px]' },
  { key: 'action', label: 'ACTION', sortable: false, width: 'w-32' },
];

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN');
}

function getSortValue(value, key) {
  if (key === 'meeting_date') return new Date(value).getTime() || 0;
  if (key === 'createdAt') return new Date(value).getTime() || 0;
  if (typeof value === 'object' && value?.username) return value.username.toLowerCase();
  if (typeof value === 'string') return value.toLowerCase();
  return value;
}

function One2OneMeetingsTable() {
  const [data, setData] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(
    TABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [sortConfig, setSortConfig] = useState({ key: 'meeting_date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/slips/one2one/getone2ones`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Could not load meetings');
        let rows = await response.json();
        setData(
          rows.map(row => ({
            ...row,
            member1Name: row.member1?.username || '',
            member2Name: row.member2?.username || '',
            createdByName: row.created_by_user?.username || '',
            meetingDateFormatted: formatDate(row.meeting_date),
          }))
        );
      } catch (err) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let result = data.filter(row =>
      TABLE_COLUMNS.some(col => {
        if (!visibleColumns[col.key] || col.key === 'action') return false;
        let value = colValue(row, col.key);
        if (Array.isArray(value)) value = value.join(' ');
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
    result = result.sort((a, b) => {
      const aValue = getSortValue(colValue(a, sortConfig.key), sortConfig.key);
      const bValue = getSortValue(colValue(b, sortConfig.key), sortConfig.key);
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, searchTerm, sortConfig, visibleColumns]);

  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  function colValue(row, key) {
    if (key === 'member1') return row.member1?.username || '';
    if (key === 'member2') return row.member2?.username || '';
    if (key === 'meeting_date') return row.meetingDateFormatted;
    if (key === 'created_by_user') return row.created_by_user?.username || '';
    return row[key];
  }

  function handleSort(key) {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }

  function toggleColumn(key) {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleExport() {
    setLoading(true);
    try {
      const header = TABLE_COLUMNS.filter(col => visibleColumns[col.key] && col.key !== 'action')
        .map(col => col.label)
        .join(',');
      const rows = filteredAndSortedData.map(row =>
        TABLE_COLUMNS.filter(col => visibleColumns[col.key] && col.key !== 'action')
          .map(col => {
            let value = colValue(row, col.key);
            if (typeof value === 'object') value = value?.username || '';
            if (typeof value === 'string' && value.includes(',')) value = `"${value}"`;
            return value;
          })
          .join(',')
      );
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `one2one_meetings_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess('Exported!');
      setTimeout(() => setSuccess(null), 1500);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Refreshed');
      setTimeout(() => setSuccess(null), 1200);
    }, 800);
  }

  async function openModal(record) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/slips/one2one/getone2onebyid/${record._id}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Could not fetch meeting details');
      const data = await response.json();
      setSelectedRecord(data);
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setSelectedRecord(null);
  }

  async function handleDelete() {
    if (!toDelete?._id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/slips/one2one/deleteone2onebyid/${toDelete._id}`,
        {
          credentials: 'include',
          method: 'DELETE'
        }
      );
      if (!response.ok) throw new Error('Failed to delete meeting record');
      setData(prev => prev.filter(r => r._id !== toDelete._id));
      setSuccess('Meeting deleted');
      setTimeout(() => setSuccess(null), 1200);
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
      setToDelete(null);
    }
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            M-to-M Meetings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Track and manage all one-to-one meetings between members in your chapter.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">
                  Search Meeting
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by member, location, discussion..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 mt-2 sm:mt-0 justify-end items-end">
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="px-6 py-2  max-h-10 rounded-lg font-bold text-sm bg-yellow-400 hover:bg-yellow-500 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-6 py-2  max-h-10 rounded-lg font-semibold text-sm bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '⟳ Refreshing' : '⟳ Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b border-gray-300 dark:border-gray-600">
            <details className="cursor-pointer">
              <summary className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hover:text-gray-900 dark:hover:text-gray-100 select-none">
                ⚙️ Column Visibility
              </summary>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {TABLE_COLUMNS.filter(col => col.key !== 'action').map(col => (
                  <label key={col.key} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key]}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded accent-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{col.label}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                  {TABLE_COLUMNS.map(col =>
                    visibleColumns[col.key] ? (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        className={`px-3 sm:px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide ${col.width} ${col.sortable ? 'cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-800' : ''
                          } transition-colors whitespace-nowrap`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{col.label}</span>
                          {col.sortable && (
                            <span className="text-xs">
                              {sortConfig.key === col.key
                                ? sortConfig.direction === 'asc'
                                  ? '↑'
                                  : '↓'
                                : '⇅'}
                            </span>
                          )}
                        </div>
                      </th>
                    ) : null
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.filter(c => visibleColumns[c.key]).length} className="py-8 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row, idx) => (
                    <tr
                      key={row._id}
                      className={`border-b border-gray-200 dark:border-gray-700 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                        } hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors`}
                    >
                      {TABLE_COLUMNS.map(col => {
                        if (!visibleColumns[col.key]) return null;
                        if (col.key === 'action') {
                          return (
                            <td key={col.key} className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium flex flex-row ${col.width} whitespace-nowrap`}>
                              <button
                                onClick={() => openModal(row)}
                                className="px-3 py-1 mr-2 bg-amber-300 hover:bg-amber-400 text-black rounded text-xs font-semibold transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setToDelete(row)}
                                className="px-3 py-1 h-8 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                                disabled={loading}
                              >
                                <Delete />
                              </button>
                            </td>
                          );
                        }
                        let value = colValue(row, col.key);
                        return (
                          <td
                            key={col.key}
                            className={`px-3 sm:px-4 dark:text-white py-3 text-xs sm:text-sm font-medium ${col.width} whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]`}
                            title={typeof value === 'string' ? value : undefined}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.filter(c => visibleColumns[c.key]).length}
                      className="px-4 py-8 text-center text-gray-600 dark:text-gray-400"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}
            </span>{' '}
            of <span className="font-semibold">{filteredAndSortedData.length}</span> results
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${currentPage === pageNum
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
        {showModal && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Meeting Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
                >
                  <HiX size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {selectedRecord.image_url && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={selectedRecord.image_url}
                      alt="Meeting"
                      className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-700 object-contain bg-gray-100 dark:bg-gray-900"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Participants</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Member 1</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                        {selectedRecord.member1?.username }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedRecord.member1?.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Member 2</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                        {selectedRecord.member2?.username || selectedRecord.member2Name || selectedRecord.member2?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedRecord.member2?.email}</p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Meeting Date</p>
                    <p className="text-lg text-gray-900 dark:text-gray-50">
                      {formatDate(selectedRecord.meeting_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Location</p>
                    <p className="text-lg text-gray-900 dark:text-gray-50">{selectedRecord.location || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Discussion Points</p>
                  <p className="text-gray-900 dark:text-gray-50">{selectedRecord.discussion_points || 'N/A'}</p>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Created By</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                      {selectedRecord.created_by_user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedRecord.created_by_user?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Chapter</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                      {selectedRecord.chapter?.chapter_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedRecord.chapter?.chapter_code}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Created At</p>
                  <p className="text-gray-900 dark:text-gray-50">{formatDateTime(selectedRecord.createdAt)}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {toDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-xs mx-auto p-6">
              <p className="text-lg mb-6 text-gray-900 dark:text-gray-100 font-semibold">
                Are you sure you want to delete this meeting record?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setToDelete(null)}
                  className="flex-1 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default One2OneMeetingsTable;
