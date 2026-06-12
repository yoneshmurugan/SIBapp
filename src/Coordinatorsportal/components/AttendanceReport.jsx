import React, { useState, useMemo, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { ArrowLeft, Users, Calendar, Search, Download, ChevronDown, ChevronUp, CheckCircle, XCircle, Bell, Phone, AlertTriangle, Send } from 'lucide-react';

const AttendanceOverview = ({ onBack }) => {
  const [rawData, setRawData] = useState([]);
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'meetings', or 'alerts'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Meetings View State
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);
  const [meetingSearchTerm, setMeetingSearchTerm] = useState('');

  // Alerts View State
  const [selectedAlertRows, setSelectedAlertRows] = useState(new Set());
  const [isAlerting, setIsAlerting] = useState(false);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/meeting/attendance/getallattendances`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch attendance');
        const data = await res.json();
        setRawData(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  // Process for Members View
  const processedMembers = useMemo(() => {
    const userMap = {};
    rawData.forEach(record => {
      const userId = record?.user?._id || "unknown";
      if (!userMap[userId]) {
        userMap[userId] = {
          id: userId,
          name: record?.user?.username || 'Unknown',
          contact: record?.user?.phone_number || 'N/A',
          totalMeetings: 0,
          presentCount: 0,
          lastPresentDate: null,
        };
      }
      userMap[userId].totalMeetings++;
      if (record?.attendance_status === 'present') {
        userMap[userId].presentCount++;
        const recordDate = new Date(record?.date);
        if (!userMap[userId].lastPresentDate || recordDate > new Date(userMap[userId].lastPresentDate)) {
          userMap[userId].lastPresentDate = record?.date;
        }
      }
    });

    return Object.values(userMap).map(user => ({
      ...user,
      attendance: user.totalMeetings > 0 ? Math.round((user.presentCount / user.totalMeetings) * 100) : 0,
      lastPresent: user.lastPresentDate
        ? new Date(user.lastPresentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A'
    })).filter(
      row =>
        (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.contact && row.contact.toString().includes(searchTerm))
    ).sort((a, b) => b.attendance - a.attendance);
  }, [rawData, searchTerm]);

  // Process for Meetings View
  const processedMeetings = useMemo(() => {
    const meetingMap = {};
    rawData.forEach(record => {
      const meetingId = record?.meeting?._id || record?.date || "unknown_meeting";
      if (!meetingMap[meetingId]) {
        meetingMap[meetingId] = {
          id: meetingId,
          title: record?.meeting?.title || 'Unknown Meeting',
          date: record?.date ? new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          timestamp: record?.date ? new Date(record.date).getTime() : 0,
          present: [],
          absent: []
        };
      }
      
      const userName = record?.user?.username || 'Unknown';
      if (record?.attendance_status === 'present') {
        meetingMap[meetingId].present.push(userName);
      } else {
        meetingMap[meetingId].absent.push(userName);
      }
    });

    return Object.values(meetingMap)
      .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.date.includes(searchTerm))
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
  }, [rawData, searchTerm]);

  // Process for Alerts View (< 75% attendance)
  const lowAttendanceMembers = useMemo(() => {
    return processedMembers
      .filter(m => m.attendance < 75)
      .sort((a, b) => a.attendance - b.attendance); // Lowest attendance first
  }, [processedMembers]);

  const averageAttendance = processedMembers.length > 0
    ? Math.round(processedMembers.reduce((a, b) => a + b.attendance, 0) / processedMembers.length)
    : 0;

  const getAttendanceColor = percentage => {
    if (percentage >= 75) return 'text-emerald-600 bg-emerald-50';
    if (percentage >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const handleSelectAllAlerts = (checked) => {
    if (checked) {
      setSelectedAlertRows(new Set(lowAttendanceMembers.map(m => m.id)));
    } else {
      setSelectedAlertRows(new Set());
    }
  };

  const handleSelectAlertRow = (id) => {
    const newSelected = new Set(selectedAlertRows);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedAlertRows(newSelected);
  };

  const handleSendAlert = async (ids = null) => {
    setIsAlerting(true);
    try {
      const targetIds = ids || Array.from(selectedAlertRows);
      const targetMembers = lowAttendanceMembers.filter(m => targetIds.includes(m.id));
      for (const member of targetMembers) {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/notification/createnotificationwithoutsender`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiverList: [member.id],
            header: `⚠️ Action Required: Low Attendance Alert`,
            content: `Hi ${member.name}, we've noticed your attendance is currently at ${member.attendance}%.\n\nYour presence is vital to the chapter's success! Please make sure to attend upcoming meetings to stay active and avoid any penalties. We hope to see you soon!`
          })
        });
        if (!res.ok) throw new Error(`Failed to send alert to ${member.name}`);
      }
      
      setSuccess(`Alert sent to ${targetMembers.length} member(s) successfully.`);
      setTimeout(() => setSuccess(null), 3000);
      setSelectedAlertRows(new Set());
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsAlerting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-gray-50/50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Records...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-28 pt-6 px-3 max-w-lg mx-auto bg-gray-50/50 dark:bg-gray-950 min-h-screen relative">
      {/* Top Navigation */}
      <div className="flex items-center gap-3 mb-6 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
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
                Attendance Overview
            </h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Analytics & History</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <p className="text-xs font-bold text-rose-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-xs font-bold text-emerald-700">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all ${
            activeTab === 'members' 
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-wider">Members</span>
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all ${
            activeTab === 'meetings' 
              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-wider">Meetings</span>
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all ${
            activeTab === 'alerts' 
              ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <div className="relative">
             <Bell className="w-4 h-4" />
             {lowAttendanceMembers.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
             )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider">Alerts</span>
        </button>
      </div>

      {/* Search Bar for Members and Meetings only */}
      {activeTab !== 'alerts' && (
        <div className="relative group w-full mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                placeholder={activeTab === 'members' ? "Search members..." : "Search meetings..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-400/30 transition-all dark:text-white"
            />
        </div>
      )}

      {/* Member Tab Content */}
      {activeTab === 'members' && (
        <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Members</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{processedMembers.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Check-in</p>
              <p className="text-2xl font-black text-emerald-500">{averageAttendance}%</p>
            </div>
          </div>

          {processedMembers.length === 0 ? (
            <p className="text-center text-gray-500 py-10 font-bold text-sm uppercase tracking-widest">No members found</p>
          ) : (
            processedMembers.map((member) => (
              <div key={member.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{member.contact}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-black ${getAttendanceColor(member.attendance)}`}>
                    {member.attendance}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-gray-50 dark:border-gray-800 pt-3 mt-2">
                  <span>{member.presentCount} / {member.totalMeetings} Meetings</span>
                  <span>Last: {member.lastPresent}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Meetings Tab Content */}
      {activeTab === 'meetings' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
          {processedMeetings.length === 0 ? (
            <p className="text-center text-gray-500 py-10 font-bold text-sm uppercase tracking-widest">No meetings found</p>
          ) : (
            processedMeetings.map((meeting) => {
              const isExpanded = expandedMeetingId === meeting.id;
              
              const filteredPresent = isExpanded && meetingSearchTerm 
                ? meeting.present.filter(name => name.toLowerCase().includes(meetingSearchTerm.toLowerCase()))
                : meeting.present;
                
              const filteredAbsent = isExpanded && meetingSearchTerm 
                ? meeting.absent.filter(name => name.toLowerCase().includes(meetingSearchTerm.toLowerCase()))
                : meeting.absent;

              const presentCount = meeting.present.length;
              const absentCount = meeting.absent.length;

              return (
                <div key={meeting.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300">
                  <div 
                    onClick={() => {
                        setExpandedMeetingId(isExpanded ? null : meeting.id);
                        if (!isExpanded) setMeetingSearchTerm('');
                    }}
                    className="p-4 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div className="pr-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white">{meeting.title}</h3>
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-1">{meeting.date}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                    
                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {presentCount} Present
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">
                        <XCircle className="w-3.5 h-3.5" />
                        {absentCount} Absent
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-50 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/50 animate-in slide-in-from-top-2">
                      <div className="relative group w-full mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search members in this meeting..."
                            value={meetingSearchTerm}
                            onChange={(e) => setMeetingSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-400/30 transition-all dark:text-white"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-end mb-2 border-b border-emerald-100 dark:border-emerald-900/50 pb-1">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            Present List ({filteredPresent.length})
                          </p>
                        </div>
                        {filteredPresent.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {filteredPresent.map((name, i) => (
                              <span key={i} className="text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded shadow-sm">
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-500 font-medium">No members found.</p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-end mb-2 border-b border-rose-100 dark:border-rose-900/50 pb-1">
                          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                            Absent List ({filteredAbsent.length})
                          </p>
                        </div>
                        {filteredAbsent.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {filteredAbsent.map((name, i) => (
                              <span key={i} className="text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded shadow-sm">
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-500 font-medium">No members found.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Alerts Tab Content */}
      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300 pb-16">
          <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/30">
             <div>
                <h3 className="text-sm font-black text-rose-900 dark:text-rose-100">Critical Alerts</h3>
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-0.5">{lowAttendanceMembers.length} Members &lt; 75%</p>
             </div>
             <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>

          <div className="flex justify-between items-center px-1">
             <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm active:scale-95 transition-transform">
                  <input
                      type="checkbox"
                      checked={selectedAlertRows.size > 0 && selectedAlertRows.size === lowAttendanceMembers.length}
                      onChange={(e) => handleSelectAllAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-gray-300"
                  />
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Select All</span>
              </label>
          </div>

          {lowAttendanceMembers.length === 0 ? (
             <div className="text-center py-10">
                 <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-50" />
                 <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">No critical members!</p>
             </div>
          ) : (
             lowAttendanceMembers.map((member) => {
                const isSelected = selectedAlertRows.has(member.id);
                return (
                   <div key={member.id} className={`bg-white dark:bg-gray-900 p-4 rounded-2xl border-2 transition-all duration-200 shadow-sm flex flex-col gap-3 ${isSelected ? 'border-rose-400 dark:border-rose-500' : 'border-gray-100 dark:border-gray-800'}`}>
                      <div className="flex items-start gap-3">
                         <div className="pt-1">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectAlertRow(member.id)}
                                className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500 border-gray-300"
                            />
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h3 className="text-sm font-black text-gray-900 dark:text-white">{member.name}</h3>
                                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">{member.contact}</p>
                               </div>
                               <div className="flex flex-col items-end">
                                  <span className={`px-2 py-1 rounded text-xs font-black ${member.attendance < 60 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {member.attendance}%
                                  </span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-2 mt-1">
                         <button 
                             onClick={() => handleSendAlert([member.id])}
                             disabled={isAlerting}
                             className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                         >
                             <Send className="w-3.5 h-3.5" /> Alert
                         </button>
                         <button 
                             onClick={() => {
                                const msg = `⚠️ Action Required: Low Attendance Alert\nHi ${member.name}, we've noticed your attendance is currently at ${member.attendance}%. 📉\n\nYour presence is vital to the chapter's success! Please make sure to attend upcoming meetings to stay active and avoid any penalties. We hope to see you soon! 🤝`;
                                window.open(`https://wa.me/${member.contact}?text=${encodeURIComponent(msg)}`, '_blank');
                             }}
                             className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                         >
                             WhatsApp
                         </button>
                         <button 
                             onClick={() => window.location.href = `tel:${member.contact}`}
                             className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                         >
                             <Phone className="w-3.5 h-3.5" /> Call
                         </button>
                      </div>
                   </div>
                );
             })
          )}

          {/* Sticky Bottom Action Bar for Bulk Alerts */}
          {lowAttendanceMembers.length > 0 && (
             <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-40 pb-6">
                <div className="max-w-lg mx-auto">
                   <button
                       onClick={() => handleSendAlert()}
                       disabled={selectedAlertRows.size === 0 || isAlerting}
                       className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                           selectedAlertRows.size > 0 
                               ? 'bg-rose-500 text-white shadow-lg' 
                               : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                       }`}
                   >
                       <Send className="w-4 h-4" />
                       Send Alert to Selected ({selectedAlertRows.size})
                   </button>
                </div>
             </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AttendanceOverview;
