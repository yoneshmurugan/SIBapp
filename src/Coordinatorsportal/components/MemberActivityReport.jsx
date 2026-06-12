import React, { useState, useMemo, useEffect } from 'react';
import { Check, X, Users, CheckCircle, UploadCloud, ChevronRight, AlertCircle, ArrowLeft, Search, Filter, History, TrendingUp, DollarSign, Handshake, Medal, ArrowDownAZ } from 'lucide-react';
import AttendanceOverview from './AttendanceReport';

function MemberActivityReport({ onBack }) {
    const [memberData, setMemberData] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState('');
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    
    // View state
    const [showHistory, setShowHistory] = useState(false);

    // Search and Filter and Sort
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED'
    const [sortBy, setSortBy] = useState('rank'); // 'rank', 'businessMade', 'referralsGiven', 'mToM', 'name'
    
    // Status Trackers
    const [submittedAttendances, setSubmittedAttendances] = useState(new Set());
    const [approvedMembers, setApprovedMembers] = useState(new Set());
    
    // UI states
    const [successModal, setSuccessModal] = useState(null); // { title: '', message: '' }
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showApprovalConfirmModal, setShowApprovalConfirmModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setFetchLoading(true);
        try {
            const [activitiesRes, meetingsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_BACKEND_SERVER}/activity/getactivityofusersfalse`, { credentials: 'include' }),
                fetch(`${import.meta.env.VITE_BACKEND_SERVER}/meeting/getfalsemeetings`, { credentials: 'include' }),
            ]);

            if (!activitiesRes.ok || !meetingsRes.ok) throw new Error('Failed to fetch data');

            const activities = await activitiesRes.json();
            const meetingsData = await meetingsRes.json();

            const processedMembers = (activities || []).map((member) => ({
                ...member,
                approvalStatus: 'PENDING',
                attendance: 'Present',
                rank: member.rank || 999,
                businessMade: member.businessMade || 0,
                referralsGiven: member.referralsGiven || 0,
                mToM: member.mToM || 0,
            }));

            setMemberData(processedMembers);
            setMeetings(meetingsData || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setFetchLoading(false);
        }
    }

    const filteredAndSortedMembers = useMemo(() => {
        // Filter
        let result = memberData.filter(m => {
            const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const isApproved = approvedMembers.has(m.id) || m.approvalStatus === 'APPROVED';
            const matchesStatus = statusFilter === 'ALL' 
                ? true 
                : statusFilter === 'APPROVED' ? isApproved : !isApproved;
            return matchesSearch && matchesStatus;
        });

        // Sort
        result.sort((a, b) => {
            switch(sortBy) {
                case 'rank':
                    return a.rank - b.rank;
                case 'businessMade':
                    return b.businessMade - a.businessMade;
                case 'referralsGiven':
                    return b.referralsGiven - a.referralsGiven;
                case 'mToM':
                    return b.mToM - a.mToM;
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                default:
                    return a.rank - b.rank;
            }
        });

        return result;
    }, [memberData, searchQuery, statusFilter, sortBy, approvedMembers]);

    const handleSelectAll = (checked) => {
        if (checked) {
            const unapproved = filteredAndSortedMembers.filter(m => !approvedMembers.has(m.id)).map(m => m.id);
            setSelectedRows(new Set(unapproved));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id) => {
        if (approvedMembers.has(id)) return;
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedRows(newSelected);
    };

    const toggleAttendance = (id) => {
        if (submittedAttendances.has(id)) return;
        setMemberData(prev => prev.map(m => {
            if (m.id === id) {
                return { ...m, attendance: m.attendance === 'Present' ? 'Absent' : 'Present' };
            }
            return m;
        }));
    };

    // --- Bulk Approval Action (Used for both single and multiple) ---
    const executeApproval = async (memberIds) => {
        setLoading(true);
        try {
            const notificationData = {
                receiverList: memberIds,
                header: `✅ Activity Report Approved!`,
                content: `Great news! Your recent meeting and business activity data has been officially verified and approved by the coordinator. Keep building those connections!`,
            };

            const [referralRes, tyftbRes, m2mRes, notificationRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_BACKEND_SERVER}/slips/referral/updatebulkreferralstatusbyreferrer`, {
                    method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "list": memberIds }),
                }),
                fetch(`${import.meta.env.VITE_BACKEND_SERVER}/slips/tyftb/updatebulktyftbstatusbypayer`, {
                    method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "list": memberIds }),
                }),
                fetch(`${import.meta.env.VITE_BACKEND_SERVER}/slips/one2one/updatebulkm2mstatusbyuserid`, {
                    method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "list": memberIds }),
                }),
                fetch(`${import.meta.env.VITE_BACKEND_SERVER}/notification/createbulknotificationwithoutsenderbyid`, {
                    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notificationData),
                }),
            ]);

            if (!referralRes.ok || !tyftbRes.ok || !m2mRes.ok || !notificationRes.ok) {
                throw new Error('Approval request failed.');
            }

            setApprovedMembers(prev => new Set([...prev, ...memberIds]));
            setMemberData(prev => prev.map(m => memberIds.includes(m.id) ? { ...m, approvalStatus: 'APPROVED' } : m));
            
            // Clean up selected rows
            const newSelected = new Set(selectedRows);
            memberIds.forEach(id => newSelected.delete(id));
            setSelectedRows(newSelected);

            setSuccessModal({
                title: 'Approval Complete',
                message: `${memberIds.length} member(s) have been successfully approved.`
            });
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
            setShowApprovalConfirmModal(false);
        }
    };

    const confirmApproveSelected = () => {
        const selectedIds = Array.from(selectedRows);
        executeApproval(selectedIds);
    };

    const handleApproveSingle = (memberId) => {
        if (approvedMembers.has(memberId)) return;
        executeApproval([memberId]);
    };

    // --- Attendance Action ---
    const confirmSubmitAttendance = async () => {
        setLoading(true);
        setShowConfirmModal(false);
        try {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const data = {
                usersdata: memberData, // we pass all members data
                meeting_id: selectedMeeting,
                date: formattedDate,
            };
            
            const attendanceRes = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/meeting/attendance/createbulkattendances`, {
                method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!attendanceRes.ok) throw new Error(await attendanceRes.text());

            const confirm_data = { _id: selectedMeeting, attendance_status: true };
            const updateMeetingRes = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/meeting/updatemeeting`, {
                method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(confirm_data),
            });

            if (!updateMeetingRes.ok) throw new Error(await updateMeetingRes.text());

            setSubmittedAttendances(new Set(memberData.map(m => m.id)));
            
            // Critical Fix: Remove the meeting from the list so it can't be submitted again
            setMeetings(prev => prev.filter(m => m._id !== selectedMeeting));
            setSelectedMeeting('');

            setSuccessModal({
                title: 'Attendance Submitted!',
                message: 'Attendance for this meeting has been successfully locked and saved to the history logs.'
            });

        } catch (err) {
            setError(err.message || 'Error during attendance submission');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    if (showHistory) {
        return <AttendanceOverview onBack={() => setShowHistory(false)} />;
    }

    if (fetchLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Hub...</p>
            </div>
        );
    }

    return (
        <div className="w-full pb-32 pt-6 px-3 max-w-lg mx-auto bg-gray-50/50 dark:bg-gray-950 min-h-screen">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                            Live Check-in
                        </h1>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Coordinator Hub</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowHistory(true)}
                    className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                    title="View History"
                >
                    <History className="w-5 h-5" />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300">{error}</p>
                </div>
            )}

            {/* Meeting Selector */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Active Meeting
                </label>
                {meetings.length === 0 ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                        <p className="text-xs font-bold text-gray-500">No active meetings available</p>
                    </div>
                ) : (
                    <select
                        value={selectedMeeting}
                        onChange={(e) => setSelectedMeeting(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-amber-400 transition-all appearance-none"
                    >
                        <option value="">-- Select a Meeting --</option>
                        {meetings.map((m) => (
                            <option key={m._id} value={m._id}>
                                {m.title} ({new Date(m.meeting_date).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                )}
                {!selectedMeeting && meetings.length > 0 && (
                    <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Select a meeting to submit attendance
                    </p>
                )}
            </div>

            {/* Search, Filter, and Sort */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-sm space-y-3">
                <div className="relative group w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-400/30 transition-all dark:text-white"
                    />
                </div>
                
                <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                    {['ALL', 'PENDING', 'APPROVED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                statusFilter === status 
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600 dark:text-amber-400' 
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none appearance-none"
                    >
                        <option value="rank">Rank (Highest First)</option>
                        <option value="businessMade">Business Made (Highest First)</option>
                        <option value="referralsGiven">Referrals Given (Highest First)</option>
                        <option value="mToM">M2M (Highest First)</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                        {filteredAndSortedMembers.length} Results
                    </span>
                </div>
                
                {statusFilter !== 'APPROVED' && (
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm active:scale-95 transition-transform">
                        <input
                            type="checkbox"
                            checked={selectedRows.size > 0 && selectedRows.size === filteredAndSortedMembers.filter(m => !approvedMembers.has(m.id)).length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-gray-300"
                        />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Select All</span>
                    </label>
                )}
            </div>

            {/* Member Cards */}
            <div className="space-y-4">
                {filteredAndSortedMembers.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">No members found</p>
                    </div>
                ) : (
                    filteredAndSortedMembers.map((member) => {
                        const isApproved = approvedMembers.has(member.id);
                        const isSelected = selectedRows.has(member.id);
                        const isPresent = member.attendance === 'Present';
                        const isAttendanceSubmitted = submittedAttendances.has(member.id);

                        return (
                            <div 
                                key={member.id} 
                                className={`bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-sm ${isSelected ? 'border-amber-400 dark:border-amber-500' : 'border-gray-100 dark:border-gray-800'}`}
                            >
                                {/* Card Header */}
                                <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-start gap-3">
                                    {/* Checkbox for Approval */}
                                    {!isApproved ? (
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(member.id)}
                                                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-gray-300"
                                            />
                                        </div>
                                    ) : (
                                        <div className="pt-1">
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white truncate pr-2">
                                                {member.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase flex items-center gap-1 ${member.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {member.rank <= 3 && <Medal className="w-3 h-3" />}
                                                Rank {member.rank}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            Status: {isApproved ? <span className="text-emerald-500">Approved</span> : <span className="text-amber-500">Pending</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-4 divide-x divide-gray-50 dark:divide-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                    <div className="p-3 text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1 flex justify-center items-center gap-0.5"><TrendingUp className="w-2 h-2"/> Refs</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{member.referralsGiven}</p>
                                    </div>
                                    <div className="p-3 text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1 flex justify-center items-center gap-0.5"><DollarSign className="w-2 h-2"/> Biz</p>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{member.businessMade}</p>
                                    </div>
                                    <div className="p-3 text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1 flex justify-center items-center gap-0.5"><Users className="w-2 h-2"/> Vis</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{member.visitorsBrought}</p>
                                    </div>
                                    <div className="p-3 text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1 flex justify-center items-center gap-0.5"><Handshake className="w-2 h-2"/> M2M</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{member.mToM}</p>
                                    </div>
                                </div>

                                {/* Attendance & Single Action */}
                                <div className="p-3 flex items-center justify-between gap-3 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800">
                                    {/* Attendance Toggle */}
                                    <button 
                                        onClick={() => toggleAttendance(member.id)}
                                        disabled={isAttendanceSubmitted}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                                            isPresent 
                                                ? 'border-emerald-100 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                                : 'border-rose-100 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                                        } ${isAttendanceSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                        <span className="text-[11px] font-black uppercase tracking-widest">
                                            {isPresent ? 'Present' : 'Absent'}
                                        </span>
                                    </button>

                                    {/* Quick Approve Button */}
                                    {!isApproved && (
                                        <button 
                                            onClick={() => handleApproveSingle(member.id)}
                                            disabled={loading}
                                            className="flex-1 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                                        >
                                            Approve
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Fixed Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-40 pb-6">
                <div className="max-w-lg mx-auto flex gap-3">
                    <button
                        onClick={() => {
                            if (selectedRows.size === 0) return setError('Select members to approve');
                            setShowApprovalConfirmModal(true);
                        }}
                        disabled={selectedRows.size === 0 || loading}
                        className={`flex-1 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                            selectedRows.size > 0 
                                ? 'bg-amber-400 text-amber-950 shadow-md' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Check className="w-4 h-4" />
                        Approve ({selectedRows.size})
                    </button>
                    
                    <button
                        onClick={() => {
                            if (!selectedMeeting) return setError('Select a meeting first');
                            setShowConfirmModal(true);
                        }}
                        disabled={loading || !selectedMeeting || submittedAttendances.size > 0}
                        className={`flex-1 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                            selectedMeeting && submittedAttendances.size === 0
                                ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <UploadCloud className="w-4 h-4" />
                        {submittedAttendances.size > 0 ? 'Locked' : 'Submit Attd'}
                    </button>
                </div>
            </div>

            {/* Confirmation Modals */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Lock & Submit Attendance</h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Are you sure you want to lock and submit attendance for this meeting? Once submitted, the meeting will be removed from the active list.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                                Cancel
                            </button>
                            <button onClick={confirmSubmitAttendance} disabled={loading} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showApprovalConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Approve {selectedRows.size} Members</h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            This will verify their referrals, TYB, and M2M slips. Notifications will be sent automatically.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowApprovalConfirmModal(false)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                                Cancel
                            </button>
                            <button onClick={confirmApproveSelected} disabled={loading} className="flex-1 py-3 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs uppercase tracking-wider shadow-md">
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Full-Screen Modal */}
            {successModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-in fade-in zoom-in">
                    <div className="flex flex-col items-center justify-center max-w-sm text-center">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <CheckCircle className="w-12 h-12 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                            {successModal.title}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            {successModal.message}
                        </p>
                        <button 
                            onClick={() => setSuccessModal(null)}
                            className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MemberActivityReport;
