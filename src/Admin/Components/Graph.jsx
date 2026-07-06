import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Graph = () => {
  // Keeping state for potential prop-driven theme in future, defaults to light
  const [isDarkMode] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/admin/chapter-revenue`,
            {
                method: "GET",
                credentials: "include"
            });
        const json = await res.json();
        // Transform API data to chart data
        const chartData = json.map(item => ({
          name: item.chapter_name,
          revenue: Number(item.total_business_amount?.$numberDecimal || 0)
        }));
        setData(chartData);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dynamic width calculation (min 100% or based on data length)
  const chartWidth = Math.max((data.length || 1) * 70, 600);

  // Formatting helpers
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumSignificantDigits: 3
    }).format(val);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl text-sm transition-colors duration-200">
          <p className="font-bold text-gray-900 dark:text-white mb-2 text-base">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400">Revenue:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                {formatCurrency(item.revenue)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen p-4 flex items-start justify-center transition-colors duration-300`}>
      <div className="w-full max-w-4xl animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue by Chapter</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Global performance across key regions
                </p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50">
            <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
              <div style={{ width: `${chartWidth}px`, height: '320px' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Loading...
                  </div>
                ) : data.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No data available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                      barSize={32}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="colorRevenueDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34D399" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#34D399" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                      />

                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: isDarkMode ? "#9CA3AF" : "#6B7280",
                          fontSize: 11,
                          fontWeight: 500
                        }}
                        interval={0}
                        dy={10}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: isDarkMode ? "#9CA3AF" : "#6B7280",
                          fontSize: 11
                        }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />

                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: isDarkMode ? '#374151' : '#F3F4F6', opacity: 0.4 }}
                      />

                      <Bar
                        dataKey="revenue"
                        fill="url(#colorRevenue)"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1500}
                      >
                        {data.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={isDarkMode ? "url(#colorRevenueDark)" : "url(#colorRevenue)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for the component */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #94A3B8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4B5563;
        }
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Graph;
