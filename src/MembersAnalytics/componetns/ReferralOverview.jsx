import { Delete, DeleteIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

const TABLE_COLUMNS = [
    { key: 'referrer', label: 'REFERRAL GIVER', sortable: true, width: 'min-w-[120px]' },
    { key: 'referee', label: 'REFERRAL RECEIVER', sortable: true, width: 'min-w-[120px]' },
    { key: 'description', label: 'DESCRIPTION', sortable: true, width: 'min-w-[200px]' },
    { key: 'referral_type', label: 'TYPE', sortable: true, width: 'w-20' },
    { key: 'referral_status', label: 'STATUS', sortable: false, width: 'min-w-[120px]' },
    { key: 'contact_phone', label: 'PHONE', sortable: false, width: 'w-28' },
    { key: 'hot', label: 'HOTNESS', sortable: true, width: 'w-20' },
    { key: 'created_at', label: 'CREATED AT', sortable: true, width: 'w-32' },
    { key: 'actions', label: 'ACTIONS', sortable: false, width: 'w-24' }
];

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
}

function getSortValue(value, key) {
    if (key === 'created_at') return new Date(value).getTime() || 0;
    if (Array.isArray(value)) return value.join(', ').toLowerCase();
    if (typeof value === 'object' && value?.username) return value.username.toLowerCase();
    if (typeof value === 'string') return value.toLowerCase();
    return value;
}

function ReferralsTable() {
    const [data, setData] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState(TABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}));
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/slips/referral/getallreferrals`, {
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Could not load referrals');
                let rows = await response.json();
                setData(
                    rows.map(row => ({
                        ...row,
                        referrerName: row.referrer?.username || '',
                        refereeName: row.referee?.username || '',
                        created_at: formatDate(row.created_at),
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
                if (!visibleColumns[col.key]) return false;
                let value = row[col.key];
                if (col.key === 'referrer') value = row.referrer?.username;
                if (col.key === 'referee') value = row.referee?.username;
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
            const header = TABLE_COLUMNS.filter(col => visibleColumns[col.key]).map(col => col.label).join(',');
            const rows = filteredAndSortedData.map(row =>
                TABLE_COLUMNS.filter(col => visibleColumns[col.key]).map(col => {
                    let value = colValue(row, col.key);
                    if (Array.isArray(value)) value = value.join('; ');
                    if (typeof value === 'object') value = value?.username || '';
                    if (typeof value === 'string' && value.includes(',')) value = `"${value}"`;
                    return value;
                }).join(',')
            );
            const csv = [header, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `referrals_${new Date().toISOString().split('T')[0]}.csv`);
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

    function colValue(row, key) {
        if (key === 'referrer') return row.referrer?.username || '';
        if (key === 'referee') return row.referee?.username || '';
        if (key === 'referral_status') return Array.isArray(row[key]) ? row[key].join(', ') : row[key];
        return row[key];
    }

    async function handleDelete() {
        if (!toDelete?._id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_SERVER}/slips/referral/deleterefferalbyid/${toDelete._id}`,
                {
                    credentials: 'include',
                    method: 'DELETE'
                }
            );
            if (!response.ok) throw new Error('Failed to delete referral');
            setData(prev => prev.filter(r => r._id !== toDelete._id));
            setSuccess('Referral deleted');
            setTimeout(() => setSuccess(null), 1200);
        } catch (err) {
            setError(err.message || 'Unexpected error');
        } finally {
            setLoading(false);
            setToDelete(null);
        }
    }

    return (
        <div className="min-w-full min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">Referral Details</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">All referrals raised by members of your chapter.</p>
                </div>
                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    </div>
                )}
                {success &&
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
                    </div>
                }
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">
                                    Search Referral
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search by member or details..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 mt-2 sm:mt-0 justify-end items-end">
                                <button
                                    onClick={handleExport}
                                    disabled={loading}
                                    className="px-6 py-2 rounded-lg max-h-10 font-bold text-sm bg-yellow-400 hover:bg-yellow-500 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Export
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="px-6 py-2 max-h-10 rounded-lg font-semibold text-sm bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                {TABLE_COLUMNS.map(col => (
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
                                    {TABLE_COLUMNS.map(col => visibleColumns[col.key] ? (
                                        <th
                                            key={col.key}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                            className={`px-3 sm:px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide ${col.width} ${col.sortable ? 'cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-800' : ''} transition-colors`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{col.label}</span>
                                                {col.sortable && (
                                                    <span className="text-xs">
                                                        {sortConfig.key === col.key ? (
                                                            sortConfig.direction === 'asc' ? '↑' : '↓'
                                                        ) : (
                                                            '⇅'
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ) : null)}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={TABLE_COLUMNS.filter(c => visibleColumns[c.key]).length} className="py-8 text-center">Loading...</td></tr>
                                ) : paginatedData.length > 0 ? (
                                    paginatedData.map((row, idx) => (
                                        <tr
                                            key={row._id}
                                            className={`border-b border-gray-200 dark:text-white dark:border-gray-700 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors`}
                                        >
                                            {TABLE_COLUMNS.map(col => {
                                                if (!visibleColumns[col.key]) return null;
                                                if (col.key === 'actions') {
                                                    return (
                                                        <td key={col.key} className="px-3 sm:px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => setToDelete(row)}
                                                                className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors"
                                                                disabled={loading}
                                                            >
                                                                <Delete />
                                                            </button>
                                                        </td>
                                                    )
                                                }
                                                let value = colValue(row, col.key);
                                                if (col.key === 'referral_status' && value) {
                                                    return (
                                                        <td key={col.key} className={`px-3 sm:px-4 dark:text-white py-3 text-xs sm:text-sm font-medium ${col.width}`}>
                                                            <span className="flex flex-wrap gap-1">
                                                                {Array.isArray(row.referral_status)
                                                                    ? row.referral_status.map((v, i) => (
                                                                        <span key={i} className="bg-yellow-100 dark:bg-yellow-800 px-2 rounded text-xs text-yellow-700 dark:text-yellow-100">{v}</span>
                                                                    ))
                                                                    : row.referral_status}
                                                            </span>
                                                        </td>
                                                    )
                                                }
                                                return (
                                                    <td key={col.key} className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium ${col.width}`}>
                                                        {value}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={TABLE_COLUMNS.filter(c => visibleColumns[c.key]).length} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
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
                        <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}</span> of{' '}
                        <span className="font-semibold">{filteredAndSortedData.length}</span> results
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
                                <option key={option} value={option}>{option} per page</option>
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
                                            className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${currentPage === pageNum ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
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
                {toDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-xs mx-auto p-6">
                            <p className="text-lg mb-6 text-gray-900 dark:text-gray-100 font-semibold">
                                Are you sure you want to delete this referral?
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

export default ReferralsTable;
