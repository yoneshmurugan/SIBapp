import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Send,
  Eye,
  X,
  Check,
  ChevronDown,
  Mail,
  AlertTriangle,
  Megaphone,
  Calendar,
  Smartphone
} from 'lucide-react';

const AlertSystem = () => {
  const [regions, setRegions] = useState([]);
  const [allChapters, setAllChapters] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    region: '',
    selectedChapters: [],
    alertType: 'announcement',
    title: '',
    message: '',
    notifyViaMail: false,
    notifyInApp: true
  });

  // Dropdown close on outside click
  const chapterDropdownRef = useRef(null);
  useEffect(() => {
    if (!isChapterDropdownOpen) return;
    const handleClickOutside = (event) => {
      if (chapterDropdownRef.current && !chapterDropdownRef.current.contains(event.target)) {
        setIsChapterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isChapterDropdownOpen]);

  // Fetch regions and chapters
  useEffect(() => {
    let ignore = false;
    const fetchRegions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/admin/region/getallregions`, {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        if (!ignore) setRegions(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setRegions([]);
      }
    };
    const fetchChapters = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/main/getallchapters`, {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        if (!ignore) setAllChapters(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setAllChapters([]);
      }
    };
    fetchRegions();
    fetchChapters();
    return () => { ignore = true; };
  }, []);

  // Filter chapters based on selected region
  const availableChapters = formData.region
    ? allChapters.filter(chapter => chapter.region && chapter.region._id === formData.region)
    : [];

  const alertTypes = [
    {
      id: 'announcement',
      label: 'Announcement',
      icon: Megaphone,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/20'
    },
    {
      id: 'urgent',
      label: 'Urgent',
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      border: 'border-rose-200 dark:border-rose-500/20'
    },
    {
      id: 'event_info',
      label: 'Event Info',
      icon: Calendar,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      border: 'border-purple-200 dark:border-purple-500/20'
    },
  ];

  // Reset selected chapters when region changes
  const handleRegionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      region: e.target.value,
      selectedChapters: []
    }));
    setIsChapterDropdownOpen(false);
  };

  // Toggle chapter selection
  const handleChapterToggle = (chapterId) => {
    setFormData(prev => {
      const isSelected = prev.selectedChapters.includes(chapterId);
      if (isSelected) {
        return { ...prev, selectedChapters: prev.selectedChapters.filter(id => id !== chapterId) };
      } else {
        return { ...prev, selectedChapters: [...prev.selectedChapters, chapterId] };
      }
    });
  };

  // Select all chapters
  const handleSelectAllChapters = () => {
    setFormData(prev => ({
      ...prev,
      selectedChapters: availableChapters.map(c => c._id)
    }));
  };

  // Deselect all chapters
  const handleDeselectAllChapters = () => {
    setFormData(prev => ({
      ...prev,
      selectedChapters: []
    }));
  };

  // Get selected chapter names for display
  const getSelectedChapterNames = () => {
    if (!formData.region) return 'Select a region first...';
    if (formData.selectedChapters.length === 0) return 'Select chapters...';
    if (formData.selectedChapters.length === availableChapters.length && availableChapters.length > 0) return 'All Regional Chapters';
    const selected = availableChapters.filter(c => formData.selectedChapters.includes(c._id));
    if (selected.length > 2) return `${selected.length} chapters selected`;
    return selected.map(c => c.chapter_name).join(', ');
  };

  const currentAlertType = alertTypes.find(t => t.id === formData.alertType) || alertTypes[0];

  // Send Notification Handler
  const handleSendNotification = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/notification/createbulknotificationsforchapters`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chapterids: formData.selectedChapters,
            header: formData.title,
            content: formData.message,
            alertType: formData.alertType,
            notifyViaMail: formData.notifyViaMail,
            notifyInApp: formData.notifyInApp
          })
        }
      );
      const data = await res.json();
      if (res.status === 201) {
        setSendResult({ success: true, message: data.message, count: data.count, receivers: data.receivers });
        setFormData({
          region: '',
          selectedChapters: [],
          alertType: 'announcement',
          title: '',
          message: '',
          notifyViaMail: false,
          notifyInApp: true
        });
      } else {
        setSendResult({ success: false, message: data.error || "Failed to create notifications" });
      }
    } catch (err) {
      setSendResult({ success: false, message: err.message || "Failed to create notifications" });
    }
    setIsSending(false);
  };

  // Keyboard accessibility for dropdown
  const handleDropdownKeyDown = (e) => {
    if (e.key === 'Escape') setIsChapterDropdownOpen(false);
  };

  return (
    <div>
      <div className="min-h-screen p-3 sm:p-6 flex items-start justify-center transition-colors duration-300 font-sans ">
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
          <div className="px-5 py-5 sm:px-8 sm:py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start sm:items-center bg-white dark:bg-slate-900">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg shrink-0">
                  <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Send Alert Notification
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                Dispatch targeted notifications to regional chapters.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
            {sendResult && (
              <div className={`rounded-xl px-4 py-3 mb-2 text-sm font-medium ${sendResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {sendResult.success ? (
                  <>
                    {sendResult.message} <br />
                    {sendResult.count ? `Notifications sent: ${sendResult.count}` : null}
                  </>
                ) : (
                  sendResult.message
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ml-1">
                  Select Region
                </label>
                <div className="relative">
                  <select
                    value={formData.region}
                    onChange={handleRegionChange}
                    className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
                  >
                    <option value="" disabled>Select a region...</option>
                    {regions.map(region => (
                      <option key={region._id} value={region._id}>{region.region_name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2 relative" ref={chapterDropdownRef}>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ml-1">
                  Target Chapters
                </label>
                <button
                  type="button"
                  disabled={!formData.region}
                  onClick={() => setIsChapterDropdownOpen(v => !v)}
                  onKeyDown={handleDropdownKeyDown}
                  aria-haspopup="listbox"
                  aria-expanded={isChapterDropdownOpen}
                  className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm font-medium transition-all duration-200 
                    ${!formData.region
                      ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400'
                      : `text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${isChapterDropdownOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`
                    }`}
                >
                  <span className="truncate">{getSelectedChapterNames()}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isChapterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isChapterDropdownOpen && formData.region && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                    {availableChapters.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/40 sticky top-0 z-10">
                          <button
                            type="button"
                            className="text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-50"
                            onClick={handleSelectAllChapters}
                            disabled={formData.selectedChapters.length === availableChapters.length}
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold text-rose-500 hover:underline disabled:opacity-50"
                            onClick={handleDeselectAllChapters}
                            disabled={formData.selectedChapters.length === 0}
                          >
                            Deselect All
                          </button>
                        </div>
                        {availableChapters.map(chapter => (
                          <div
                            key={chapter._id}
                            onClick={() => handleChapterToggle(chapter._id)}
                            className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors"
                            tabIndex={0}
                            role="option"
                            aria-selected={formData.selectedChapters.includes(chapter._id)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') handleChapterToggle(chapter._id);
                            }}
                          >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 transition-all duration-200 ${formData.selectedChapters.includes(chapter._id)
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                              }`}>
                              {formData.selectedChapters.includes(chapter._id) && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{chapter.chapter_name}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">No chapters found in this region.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ml-1">Alert Category</label>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {alertTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, alertType: type.id }))}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-200 ${formData.alertType === type.id
                        ? `bg-white dark:bg-slate-800 ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ${type.border} shadow-sm`
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <type.icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 transition-colors ${formData.alertType === type.id ? type.color : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className={`text-[10px] sm:text-xs font-semibold text-center transition-colors ${formData.alertType === type.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ml-1">Alert Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Annual Summit Registration Open"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
                maxLength={100}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ml-1">Message Content</label>
              <textarea
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Type your alert message here..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 text-right font-medium">
                {formData.message.length}/500 characters
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${formData.notifyViaMail ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/30' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${formData.notifyViaMail ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Email</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Send via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifyViaMail}
                    onChange={(e) => setFormData(prev => ({ ...prev, notifyViaMail: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${formData.notifyInApp ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${formData.notifyInApp ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">In-App</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Push to device</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifyInApp}
                    onChange={(e) => setFormData(prev => ({ ...prev, notifyInApp: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                Preview Alert
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                disabled={
                  isSending ||
                  !formData.region ||
                  !formData.selectedChapters.length ||
                  !formData.title.trim() ||
                  !formData.message.trim() ||
                  (!formData.notifyViaMail && !formData.notifyInApp)
                }
                className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:-translate-y-0.5 ${isSending ||
                    !formData.region ||
                    !formData.selectedChapters.length ||
                    !formData.title.trim() ||
                    !formData.message.trim() ||
                    (!formData.notifyViaMail && !formData.notifyInApp)
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                  }`}
              >
                <Send className="w-4 h-4" />
                {isSending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Alert Preview</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/50">
              <div className={`p-5 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-800 ${currentAlertType.id === 'announcement' ? 'border-l-blue-500' :
                  currentAlertType.id === 'urgent' ? 'border-l-rose-500' :
                    'border-l-purple-500'
                }`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-full shrink-0 ${currentAlertType.bg}`}>
                    <currentAlertType.icon className={`w-5 h-5 ${currentAlertType.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${currentAlertType.bg} ${currentAlertType.color}`}>
                        {currentAlertType.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Just now</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight break-words">
                      {formData.title || "Alert Title"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                      {formData.message || "Alert message content will appear here..."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Region</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold">
                    {regions.find(r => r._id === formData.region)?.region_name || 'Not Selected'}
                  </span>
                </div>
                <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Chapters</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold text-right max-w-[50%] sm:max-w-[60%] truncate">{getSelectedChapterNames()}</span>
                </div>
                {(formData.notifyViaMail || formData.notifyInApp) && (
                  <>
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                    <div className="flex flex-col gap-1 mt-1">
                      {formData.notifyViaMail && (
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                          <Mail className="w-3.5 h-3.5" />
                          Email notification enabled
                        </div>
                      )}
                      {formData.notifyInApp && (
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                          <Smartphone className="w-3.5 h-3.5" />
                          In-App notification enabled
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end sticky bottom-0 z-10">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm w-full sm:w-auto"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;
