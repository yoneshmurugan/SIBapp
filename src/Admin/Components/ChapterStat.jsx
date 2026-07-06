import { useState, useEffect } from 'react';
import { Users, FileCheck, IndianRupee, Handshake, ChevronDown, Calendar } from 'lucide-react';

// Utility: Auto-format numbers to Indian System (k, L, Cr)
const formatIndianNumber = (num, isCurrency = false) => {
    if (!num && num !== 0) return "0";
    const cleanNum = Number(String(num).replace(/,/g, '').replace(/[^0-9.]/g, ''));
    let formattedValue = "";
    let suffix = "";
    if (cleanNum >= 10000000) {
        formattedValue = (cleanNum / 10000000).toFixed(2); // Crores
        suffix = "Cr";
    } else if (cleanNum >= 100000) {
        formattedValue = (cleanNum / 100000).toFixed(2); // Lakhs
        suffix = "L";
    } else if (cleanNum >= 1000) {
        formattedValue = (cleanNum / 1000).toFixed(1); // Thousands
        suffix = "k";
    } else {
        formattedValue = cleanNum;
    }
    formattedValue = String(formattedValue).replace(/\.00$/, '').replace(/\.0$/, '');
    const prefix = isCurrency ? "₹ " : "";
    return `${prefix}${formattedValue}${suffix}`;
};

const timeRangeToQuery = {
    ytd: '', // all
    '12m': 'year',
    last_month: 'month',
    last_week: 'week'
};

const ChapterStat = ({ chapterid = null }) => {
    const [timeRange, setTimeRange] = useState('ytd');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            let query = timeRangeToQuery[timeRange];
            let url = chapterid
                ? `${import.meta.env.VITE_BACKEND_SERVER}/admin/chapter-performance/${chapterid}`
                : `${import.meta.env.VITE_BACKEND_SERVER}/public/stats`;
            if (query) url += `?time=${query}`;
            try {
                const res = await fetch(url, { credentials: 'include' });
                const data = await res.json();
                setStats(data);
            } catch {
                setStats(null);
            }
            setLoading(false);
        };
        fetchStats();
    }, [timeRange, chapterid]);

    const statsConfig = [
        {
            id: 1,
            label: "Referrals Passed",
            value: stats?.referrals ?? 0,
            isCurrency: false,
            icon: FileCheck,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            id: 2,
            label: "Total Members",
            value: stats?.members ?? 0,
            isCurrency: false,
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50 dark:bg-violet-900/20"
        },
        {
            id: 3,
            label: "TYFTBs",
            value: stats?.tyftbs ?? 0,
            isCurrency: false,
            icon: IndianRupee,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            id: 4,
            label: "M to M functions",
            value: stats?.m2ms ?? 0,
            isCurrency: false,
            icon: Handshake,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-900/20"
        }
    ];

    return (
        <div className="w-full p-4 sm:p-6 flex flex-col items-center justify-start space-y-4 sm:space-y-6">
            {/* Header Area with Dropdown */}
            <div className="w-full max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {stats?.chapter?.name ? `${stats.chapter.name} Overview` : "Overview"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track your community growth and engagement.
                    </p>
                </div>
                <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full sm:w-auto appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-10 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
                    >
                        <option value="ytd">Year to Date</option>
                        <option value="12m">Last 12 Months</option>
                        <option value="last_month">Last Month</option>
                        <option value="last_week">Last Week</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>
            {/* Main Grid Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-7xl">
                {statsConfig.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.id}
                            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                        >
                            {/* Icon Header */}
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className={`p-2 sm:p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={20} strokeWidth={2.5} className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                            </div>
                            {/* Data */}
                            <div className="space-y-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-all duration-300">
                                    {loading ? '...' : formatIndianNumber(stat.value, stat.isCurrency)}
                                </h3>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChapterStat;