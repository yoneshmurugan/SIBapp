import React, { useState } from "react";
import { Image, ClipboardCheck, BarChart2, ChevronRight, Users, Activity, Clock, ShieldCheck, FileText } from "lucide-react";
import Header from "../MainPage/Header";
import MemberActivityReport from "./components/MemberActivityReport";
import AttendanceOverview from './components/AttendanceReport';
import PhotoGallery from './components/PhotoGall';

function Coordinatorsportal() {
  const [showGallery, setShowGallery] = useState(false);
  const [showActivityReport, setShowActivityReport] = useState(false);
  const [showAttendanceOverview, setShowAttendanceOverview] = useState(false);

  if (showGallery) {
    return <PhotoGallery onBack={() => setShowGallery(false)} />;
  }

  if (showActivityReport) {
    return <MemberActivityReport onBack={() => setShowActivityReport(false)} />;
  }

  if (showAttendanceOverview) {
    return <AttendanceOverview onBack={() => setShowAttendanceOverview(false)} />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <Header />
      </div>

      <div className="pt-24 px-4 pb-12 w-full max-w-lg mx-auto animate-in fade-in duration-300">
        
        {/* Page Header */}
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Coordinator Dashboard</h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Manage operations and monitor chapter activity.</p>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Network</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">Active</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Chapter Members</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">Online</p>
                <p className="text-[10px] text-gray-500 mt-0.5">System Operations</p>
            </div>
        </div>

        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Primary Actions</h2>

        {/* Action Buttons Container */}
        <div className="space-y-3 mb-8">
            
            {/* Live Check-in Card */}
            <button
                onClick={() => setShowActivityReport(true)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between transition-all active:scale-[0.98] active:bg-gray-50 dark:active:bg-gray-800 shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <ClipboardCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Live Check-in</h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Record attendance & approve members</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Attendance Overview Card */}
            <button
                onClick={() => setShowAttendanceOverview(true)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between transition-all active:scale-[0.98] active:bg-gray-50 dark:active:bg-gray-800 shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                        <BarChart2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Analytics & History</h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Track historical attendance data</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Event Gallery Card */}
            <button
                onClick={() => setShowGallery(true)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between transition-all active:scale-[0.98] active:bg-gray-50 dark:active:bg-gray-800 shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                        <Image className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Event Gallery</h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Manage chapter photo assets</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

        </div>

        {/* Informational Section to Fill Space */}
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-500" /> Coordinator Guidelines
            </h3>
            
            <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                    <Clock className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Timely Submissions</p>
                        <p className="text-xs text-gray-500 mt-1">Ensure attendance is locked and submitted immediately after the meeting concludes to maintain accurate analytics.</p>
                    </div>
                </li>
                <li className="flex gap-3 items-start">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Data Integrity</p>
                        <p className="text-xs text-gray-500 mt-1">Verify all slips and business numbers carefully before hitting "Approve" in the Live Check-in module.</p>
                    </div>
                </li>
            </ul>
        </div>

      </div>
    </div>
  );
}

export default Coordinatorsportal;