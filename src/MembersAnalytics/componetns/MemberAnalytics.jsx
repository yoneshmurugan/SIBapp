import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Download, 
  RefreshCw, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Check,
  Calendar
} from 'lucide-react';

const TABLE_COLUMNS = [
    { key: 'rank', label: 'Rank', sortable: true, width: 'w-16 sm:w-20 text-center' },
    { key: 'name', label: 'Member Name', sortable: true, width: 'min-w-[150px] sm:min-w-[200px]' },
    { key: 'referralsGiven', label: 'Refs Given', sortable: true, width: 'w-24 sm:w-32 text-right' },
    { key: 'referralsReceived', label: 'Refs Recd', sortable: true, width: 'w-24 sm:w-32 text-right' },
    { key: 'tyftbGiven', label: 'TYB Given', sortable: true, width: 'w-28 sm:w-32 text-right' },
    { key: 'tyftbReceived', label: 'TYB Recd', sortable: true, width: 'w-28 sm:w-32 text-right' },
    { key: 'businessMade', label: 'Biz Made', sortable: true, width: 'w-32 sm:w-36 text-right' },
    { key: 'businessGiven', label: 'Biz Given', sortable: true, width: 'w-32 sm:w-36 text-right' },
    { key: 'mToM', label: 'M to M', sortable: true, width: 'w-24 sm:w-28 text-right' },
    { key: 'visitorsBrought', label: 'Visitors', sortable: true, width: 'w-24 sm:w-28 text-right' },
];

function parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    if (value.includes('₹') && value.includes('cr')) {
        return parseFloat(value.replace(/[₹,cr\s]/g, ''));
    }
    if (value.includes('₹') && value.includes('L')) {
        return parseFloat(value.replace(/[₹,L\s]/g, ''));
    }
    return parseFloat(value.replace(/[₹,]/g, '')) || 0;
}

function formatToCr(val) {
    let n = parseNumber(val);
    if (isNaN(n) || n === 0) return "₹0";
    return `₹${n}`;
}

function getTotalRow(data, visibleColumns) {
    const totals = {
        rank: null,
        name: 'TOTAL',
        referralsGiven: 0,
        referralsReceived: 0,
        tyftbGiven: 0,
        tyftbReceived: 0,
        businessMade: 0,
        businessGiven: 0,
        mToM: 0,
        visitorsBrought: 0,
    };
    
    data.forEach(row => {
        Object.keys(totals).forEach(key => {
            if (key === 'name' || key === 'rank') return;
            totals[key] += parseNumber(row[key]);
        });
    });

    let result = {};
    TABLE_COLUMNS.forEach(col => {
        if (!visibleColumns[col.key]) return;
        if (col.key === 'rank') result[col.key] = '';
        else if (col.key === 'name') result[col.key] = 'TOTAL';
        else if (col.key === 'businessMade' || col.key === 'businessGiven')
            result[col.key] = formatToCr(totals[col.key]);
        else
            result[col.key] = totals[col.key];
    });
    return result;
}

const getSortValue = (value, columnKey) => {
    if (columnKey === 'businessMade' || columnKey === 'businessGiven')
        return parseNumber(value);
    if (typeof value === 'string') return value.toLowerCase();
    return value;
};

const MemberDetailedAnalyticsReport = () => {
    const [members, setMembers] = useState([]);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState(
        TABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    );
    const [sortConfig, setSortConfig] = useState({
        key: 'rank',
        direction: 'asc'
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Construct URL with date query parameters if they exist
            let url = `${import.meta.env.VITE_BACKEND_SERVER}/activity/getactivityofusers`;
            const params = new URLSearchParams();
            if (dateRange.from) params.append('fromDate', dateRange.from);
            if (dateRange.to) params.append('toDate', dateRange.to);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                credentials: 'include'
            });
            
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            let data = await response.json();
            data = data.map((item, i) => ({
                ...item,
                rank: i + 1,
                businessMade: formatToCr(item.businessMade),
                businessGiven: formatToCr(item.businessGiven)
            }));
            setMembers(data);
        } catch (err) {
            setError('Unable to load analytics: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when dates change (you might want to debounce this or use a button if changes are frequent)
    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const filteredAndSortedData = useMemo(() => {
        let result = members.filter(row =>
            row.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        result = [...result].sort((a, b) => {
            const aValue = getSortValue(a[sortConfig.key], sortConfig.key);
            const bValue = getSortValue(b[sortConfig.key], sortConfig.key);
            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            else if (aValue > bValue) comparison = 1;
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
        return result;
    }, [members, searchTerm, sortConfig]);

    const TOTAL_ROW = getTotalRow(filteredAndSortedData, visibleColumns);

    const handleSort = (columnKey) => {
        setSortConfig(prev => ({
            key: columnKey,
            direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleExport = () => {
        try {
            const csvHeader = TABLE_COLUMNS.filter(col => visibleColumns[col.key]).map(col => col.label).join(',');
            const csvRows = filteredAndSortedData.map(row =>
                TABLE_COLUMNS.filter(col => visibleColumns[col.key]).map(col => {
                    const value = row[col.key];
                    return typeof value === 'string' ? `"${value}"` : value;
                }).join(',')
            );
            const csv = [csvHeader, ...csvRows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `member_analytics_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSuccess('Data exported successfully');
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Export failed');
        }
    };

    const handleRefresh = async () => {
        await fetchData();
        setSuccess('Data refreshed successfully');
        setTimeout(() => setSuccess(null), 2000);
    };

    return (
        <div className="mt-10 w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col h-[85vh]">
            
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:gap-6 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">Member Analytics</h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Detailed performance metrics and referral tracking
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                         <button
                            onClick={handleExport}
                            className="whitespace-nowrap flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                        >
                            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <span className="hidden xs:inline">Export CSV</span>
                            <span className="inline xs:hidden">Export</span>
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="whitespace-nowrap flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
                            disabled={loading}
                        >
                            <RefreshCw size={16} className={`sm:w-[18px] sm:h-[18px] ${loading ? "animate-spin" : ""}`} />
                            <span className="hidden xs:inline">Refresh</span>
                            <span className="inline xs:hidden">Reload</span>
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {(error || success) && (
                    <div className={`p-3 rounded-lg text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
                        error 
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-100 dark:border-red-800' 
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800'
                    }`}>
                        {error || success}
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    
                    {/* Date Range Selectors */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap w-10 sm:w-auto">From:</span>
                            <div className="relative group w-full sm:w-auto">
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                    className="w-full sm:w-36 lg:w-40 px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap w-10 sm:w-auto">To:</span>
                            <div className="relative group w-full sm:w-auto">
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                    className="w-full sm:w-36 lg:w-40 px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 sm:gap-3">
                        {/* Search */}
                        <div className="relative group flex-1 sm:min-w-[200px] lg:min-w-[280px]">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search member..."
                                className="w-full pl-9 sm:pl-10 pr-4 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                            <Search className="absolute left-3 top-2 sm:top-2.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 w-4 h-4 sm:w-4 sm:h-4" />
                        </div>

                        {/* Column Visibility Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowColumnMenu(!showColumnMenu)}
                                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${showColumnMenu ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
                            >
                                <SlidersHorizontal size={14} className="sm:w-4 sm:h-4" />
                                <span>Cols</span>
                            </button>
                            
                            {showColumnMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowColumnMenu(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-full sm:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 p-2 animate-in fade-in slide-in-from-top-2 duration-200 max-w-[90vw] left-0 sm:left-auto">
                                        <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
                                            {TABLE_COLUMNS.map(col => (
                                                <label key={col.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-xs sm:text-sm text-gray-700 dark:text-gray-300 select-none">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${visibleColumns[col.key] ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400 dark:border-gray-500'}`}>
                                                        {visibleColumns[col.key] && <Check size={12} strokeWidth={3} />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={visibleColumns[col.key]}
                                                        onChange={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                                                    />
                                                    {col.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area - Scrollable */}
            <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col shadow-sm">
                <div className="overflow-auto flex-1 relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-sm text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            <tr>
                                {TABLE_COLUMNS.map(col => {
                                    if (!visibleColumns[col.key]) return null;
                                    return (
                                        <th
                                            key={col.key}
                                            className={`p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 ${col.width} ${col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''} transition-colors whitespace-nowrap`}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                        >
                                            <div className={`flex items-center gap-1 ${col.width.includes('right') ? 'justify-end' : col.width.includes('center') ? 'justify-center' : 'justify-start'}`}>
                                                {col.label}
                                                {col.sortable && (
                                                    <span className="text-gray-400">
                                                        {sortConfig.key === col.key ? (
                                                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                                        ) : (
                                                            <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw className="animate-spin text-blue-500" size={24} />
                                            <span>Loading analytics data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAndSortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="p-12 text-center text-gray-500">
                                        No data found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedData.map((row, idx) => (
                                    <tr 
                                        key={idx}
                                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group"
                                    >
                                        {TABLE_COLUMNS.map(col => {
                                            if (!visibleColumns[col.key]) return null;
                                            return (
                                                <td key={col.key} className={`p-2 sm:p-3 text-gray-900 dark:text-gray-200 ${col.width}`}>
                                                    {col.key === 'rank' ? (
                                                        <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold ${
                                                            row.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                            row.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                            row.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                            'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                                                        }`}>
                                                            {row.rank}
                                                        </span>
                                                    ) : row[col.key]}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {/* Sticky Footer for Totals */}
                        {!loading && filteredAndSortedData.length > 0 && (
                            <tfoot className="sticky bottom-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm border-t border-gray-200 dark:border-gray-700">
                                <tr>
                                    {TABLE_COLUMNS.map(col => {
                                        if (!visibleColumns[col.key]) return null;
                                        return (
                                            <td key={col.key} className={`p-2 sm:p-3 ${col.width} bg-gray-50 dark:bg-gray-800`}>
                                                {TOTAL_ROW[col.key]}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
            
            {/* Status Bar */}
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center px-2 shrink-0">
                <span>Total Members: {filteredAndSortedData.length}</span>
                <span>
                    {dateRange.from || dateRange.to 
                        ? `Filtered: ${dateRange.from || '...'} to ${dateRange.to || '...'}`
                        : 'Lifetime Data'}
                </span>
            </div>
        </div>
    );
};

export default MemberDetailedAnalyticsReport;