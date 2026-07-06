import { useState, useMemo, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    ArrowUpDown
} from 'lucide-react';

const formatIndianNumber = (num, isCurrency = false) => {
    if (!num && num !== 0) return "0";
    const cleanNum = Number(String(num).replace(/,/g, '').replace(/[^0-9.]/g, ''));
    let formattedValue = "";
    let suffix = "";
    if (cleanNum >= 10000000) {
        formattedValue = (cleanNum / 10000000).toFixed(2);
        suffix = "Cr";
    } else if (cleanNum >= 100000) {
        formattedValue = (cleanNum / 100000).toFixed(2);
        suffix = "L";
    } else if (cleanNum >= 1000) {
        formattedValue = (cleanNum / 1000).toFixed(1);
        suffix = "k";
    } else {
        formattedValue = cleanNum;
    }
    formattedValue = String(formattedValue).replace(/\.00$/, '').replace(/\.0$/, '');
    const prefix = isCurrency ? "₹ " : "";
    return `${prefix}${formattedValue}${suffix}`;
};

const TIME_RANGE_MAP = {
    all_time: "All Time",
    month: "Last Month",
    week: "Last Week"
};

const StatTable = () => {
    const [tableTimeRange, setTableTimeRange] = useState('all_time');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch and merge data based on time range
    useEffect(() => {
        setLoading(true);
        fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/admin/chapter-performance?time=${tableTimeRange}`,
            {
                method: "GET",
                credentials: "include"
            }
        )
            .then(res => res.json())
            .then(data => {
                // Merge data by chapter _id
                const chapters = data.chapters || [];
                const membersMap = Object.fromEntries((data.members || []).map(m => [m._id, m.total_members]));
                const referralsMap = Object.fromEntries((data.referrals || []).map(r => [r._id, r.total_referrals]));
                const m2mMap = Object.fromEntries((data.m2ms || []).map(m => [m._id, m.total_m2m]));
                const tyftbsMap = Object.fromEntries((data.tyftbs || []).map(t => [t._id, Number(t.total_business_amount?.$numberDecimal || t.total_business_amount || 0)]));
                const merged = chapters.map(ch => ({
                    id: ch._id,
                    chapter: ch.chapter_name,
                    region: ch.region?.region_name || '',
                    members: membersMap[ch._id] || 0,
                    referrals: referralsMap[ch._id] || 0,
                    revenue: tyftbsMap[ch._id] || 0,
                    mtom: m2mMap[ch._id] || 0 // Not available in API, set to 0 or compute if needed
                }));
                setTableData(merged);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [tableTimeRange]);

    // Filter and Sort Logic
    const processedData = useMemo(() => {
        let data = [...tableData];
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(item =>
                item.chapter.toLowerCase().includes(lowerTerm) ||
                item.region.toLowerCase().includes(lowerTerm)
            );
        }
        if (sortConfig.key) {
            data.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [searchTerm, sortConfig, tableData]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} className="text-emerald-600" />
            : <ChevronDown size={14} className="text-emerald-600" />;
    };

    return (
        <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chapter Performance</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Detailed breakdown by region and chapter</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Chapter or Region..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    {/* Table Dropdown */}
                    <div className="relative">
                        <select
                            value={tableTimeRange}
                            onChange={(e) => setTableTimeRange(e.target.value)}
                            className="appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <option value="all_time">All Time</option>
                            <option value="month">Last Month</option>
                            <option value="week">Last Week</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Table Content */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 shadow-sm">
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th
                                className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => handleSort('chapter')}
                            >
                                <div className="flex items-center gap-2">Chapter {renderSortIcon('chapter')}</div>
                            </th>
                            <th
                                className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => handleSort('region')}
                            >
                                <div className="flex items-center gap-2">Region {renderSortIcon('region')}</div>
                            </th>
                            <th
                                className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-right"
                                onClick={() => handleSort('members')}
                            >
                                <div className="flex items-center justify-end gap-2">Members {renderSortIcon('members')}</div>
                            </th>
                            <th
                                className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-right"
                                onClick={() => handleSort('mtom')}
                            >
                                <div className="flex items-center justify-end gap-2">M to M {renderSortIcon('mtom')}</div>
                            </th>
                            <th
                                className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-right"
                                onClick={() => handleSort('referrals')}
                            >
                                <div className="flex items-center justify-end gap-2">Referrals {renderSortIcon('referrals')}</div>
                            </th>
                            <th
                                className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-right"
                                onClick={() => handleSort('revenue')}
                            >
                                <div className="flex items-center justify-end gap-2">Revenue {renderSortIcon('revenue')}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : processedData.length > 0 ? (
                            processedData.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.chapter}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {row.region}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">{row.members}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {formatIndianNumber(row.mtom)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {formatIndianNumber(row.referrals)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-500">
                                            {formatIndianNumber(row.revenue, true)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No chapters found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StatTable;
