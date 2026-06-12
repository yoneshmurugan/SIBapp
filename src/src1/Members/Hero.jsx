import React from 'react'
import useFetch from '../../hooks/useFetch'

function Hero() {
    const { data: stats } = useFetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/public/stats`,
        { method: "GET", credentials: "include" }
    );

    return (
        <div className="container" id="hero" style={{ padding: '30px 20px', background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.05), transparent)' }}>
            <div className="member text-center">
                <div className="header-content max-w-4xl mx-auto">
                    <h1 className="page-title text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        Our Members Directory
                    </h1>
                    
                    <div className="member-stats flex flex-wrap justify-center gap-8 mb-8">
                        <div className="stat-item bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 min-w-[160px]">
                            <span className="stat-number block text-3xl font-black text-amber-500 mb-1">
                                {stats?.membershipcount || "139"}
                            </span>
                            <span className="stat-label text-xs font-bold uppercase tracking-widest text-gray-400">
                                Active Members
                            </span>
                        </div>
                        <div className="stat-item bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 min-w-[160px]">
                            <span className="stat-number block text-3xl font-black text-amber-500 mb-1">
                                {stats?.verticalcount || "15"}+
                            </span>
                            <span className="stat-label text-xs font-bold uppercase tracking-widest text-gray-400">
                                Business Verticals
                            </span>
                        </div>
                        <div className="stat-item bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 min-w-[160px]">
                            <span className="stat-number block text-3xl font-black text-amber-500 mb-1">
                                {stats?.regioncount || "5"}
                            </span>
                            <span className="stat-label text-xs font-bold uppercase tracking-widest text-gray-400">
                                Regions
                            </span>
                        </div>
                    </div>
                    
                    <p className="tagline text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-400">
                        Connecting Sengunthar Business Community across Tamil Nadu
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Hero