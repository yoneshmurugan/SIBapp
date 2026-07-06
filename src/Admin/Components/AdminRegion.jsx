import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Globe,
  Building,
  Edit2,
  Search,
  ExternalLink,
} from 'lucide-react';

// --- Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    Forming: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    Suspended: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    Inactive: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  };
  const style = styles[status] || styles.Inactive;
  return (
    <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded border ${style}`}>
      {status}
    </span>
  );
};

export default function RegionChapterManager() {
  const [regions, setRegions] = useState([]);
  // const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [activeRegionId, setActiveRegionId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode] = useState(false);

  const [regionForm, setRegionForm] = useState({ name: '', code: '', country: '', status: 'Active' });
  const [chapterForm, setChapterForm] = useState({
    name: '', code: '', status: 'Active', day: 'Monday', time: '07:00', location: '', address: ''
  });

  const [expandedRegions, setExpandedRegions] = useState({});
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [regionsRes, chaptersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_SERVER}/admin/region/getallregions`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/main/getallchapters`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
        ]);
        if (!regionsRes.ok || !chaptersRes.ok) {
          throw new Error("Failed to fetch regions or chapters.");
        }
        const regionsData = await regionsRes.json();
        const chaptersData = await chaptersRes.json();

        const regionMap = {};
        regionsData.forEach(region => {
          regionMap[region._id] = {
            id: region._id,
            name: region.region_name,
            code: region.region_code,
            country: region.country,
            status: 'Active',
            chapters: [],
          };
        });

        chaptersData.forEach(chapter => {
          const regionId = chapter.region?._id;
          if (regionMap[regionId]) {
            regionMap[regionId].chapters.push({
              id: chapter._id,
              name: chapter.chapter_name,
              code: chapter.chapter_code,
              status: chapter.chapter_status ? 'Active' : 'Inactive',
              meetingDay: chapter.meeting_day,
              meetingTime: chapter.meeting_time,
              meetingLocation: chapter.meeting_location,
              meetingAddress: chapter.meeting_address,
            });
          }
        });

        setRegions(Object.values(regionMap));
        // setChapters(chaptersData);
      } catch (err) {
        setError(err.message || 'Error fetching data');
        setRegions([]);
        // setChapters([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredRegions = useMemo(() => {
    if (!searchQuery) return regions;
    const lowerQuery = searchQuery.toLowerCase();
    return regions.filter(region => {
      const regionMatch = region.name.toLowerCase().includes(lowerQuery) || region.code.toLowerCase().includes(lowerQuery);
      const chapterMatch = region.chapters.some(c => c.name.toLowerCase().includes(lowerQuery) || c.code.toLowerCase().includes(lowerQuery));
      return regionMatch || chapterMatch;
    });
  }, [regions, searchQuery]);

  const toggleRegion = (id) => {
    setExpandedRegions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- REGION HANDLERS ---

  const openRegionModal = (region = null) => {
    if (region) {
      setEditingId(region.id);
      setRegionForm({
        name: region.name,
        code: region.code,
        country: region.country,
        status: region.status || 'Active'
      });
    } else {
      setEditingId(null);
      setRegionForm({ name: '', code: '', country: '', status: 'Active' });
    }
    setIsRegionModalOpen(true);
  };

  const handleRegionSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (editingId) {
      // Update region via API
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/admin/region/updateregionbyid/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              region_name: regionForm.name,
              region_code: regionForm.code,
              country: regionForm.country,
            }),
          }
        );
        if (!res.ok) throw new Error("Failed to update region.");
        setRegions(regions.map(r => r.id === editingId ? { ...r, ...regionForm } : r));
        setIsRegionModalOpen(false);
      } catch (err) {
        setError(err.message || "Error updating region.");
      }
    } else {
      // CREATE region via API
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/admin/region/createregion`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              region_name: regionForm.name,
              region_code: regionForm.code,
              country: regionForm.country,
            }),
          }
        );
        if (!res.ok) throw new Error("Failed to create region.");
        const data = await res.json();
        const newRegion = {
          id: data._id,
          name: data.region_name,
          code: data.region_code,
          country: data.country,
          status: 'Active',
          chapters: []
        };
        setRegions([...regions, newRegion]);
        setIsRegionModalOpen(false);
      } catch (err) {
        setError(err.message || "Error creating region.");
      }
    }
  };

  // --- CHAPTER HANDLERS ---

  const openChapterModal = (regionId, chapter = null) => {
    setActiveRegionId(regionId);
    if (chapter) {
      setEditingId(chapter.id);
      setChapterForm({
        name: chapter.name,
        code: chapter.code,
        status: chapter.status || 'Active',
        day: chapter.meetingDay,
        time: chapter.meetingTime,
        location: chapter.meetingLocation,
        address: chapter.meetingAddress
      });
    } else {
      setEditingId(null);
      setChapterForm({
        name: '', code: '', status: 'Active', day: 'Monday', time: '07:00', location: '', address: ''
      });
    }
    setIsChapterModalOpen(true);
  };

  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const regionObj = regions.find(r => r.id === activeRegionId);
    const newChapterData = {
      id: editingId || Date.now().toString(),
      name: chapterForm.name,
      code: chapterForm.code,
      status: chapterForm.status,
      meetingDay: chapterForm.day,
      meetingTime: chapterForm.time,
      meetingLocation: chapterForm.location,
      meetingAddress: chapterForm.address
    };

    if (editingId) {
      // Update chapter via API
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/chapter/main/updatechapterbyid/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              chapter_name: chapterForm.name,
              chapter_code: chapterForm.code,
              region_name: regionObj ? regionObj.name : "",
              meeting_day: chapterForm.day,
              meeting_time: chapterForm.time,
              meeting_location: chapterForm.location,
              meeting_address: chapterForm.address,
              founded_date: new Date().toISOString().split('T')[0],
              max_members: 100,
              current_member_count: 90,
            }),
          }
        );
        if (!res.ok) throw new Error("Failed to update chapter.");
        setRegions(regions.map(region => {
          if (region.id === activeRegionId) {
            return {
              ...region,
              chapters: region.chapters.map(c => c.id === editingId ? { ...c, ...newChapterData } : c)
            };
          }
          return region;
        }));
        setIsChapterModalOpen(false);
      } catch (err) {
        setError(err.message || "Error updating chapter.");
      }
    } else {
      // CREATE chapter via API
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/chapter/main/createchapter`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              chapter_name: chapterForm.name,
              chapter_code: chapterForm.code,
              region_name: regionObj ? regionObj.name : "",
              meeting_day: chapterForm.day,
              meeting_time: chapterForm.time,
              meeting_location: chapterForm.location,
              meeting_address: chapterForm.address,
              chapter_status: true,
              founded_date: new Date().toISOString().split('T')[0],
              max_members: 100,
              current_member_count: 90,
            }),
          }
        );
        if (!res.ok) throw new Error("Failed to create chapter.");
        // Membership creation
        const presidentRes = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/createpresident`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "SIBSangam",
              role: "member",
              membership_status: true,
              chapter_name: chapterForm.name,
              join_date: new Date().toISOString().split('T')[0],
              renewal_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
            })
          }
        );
        if (!presidentRes.ok) throw new Error("Failed to create SIBSangam member.");
        const visitorRes = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/createpresident`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "Visitors",
              role: "member",
              membership_status: true,
              chapter_name: chapterForm.name,
              join_date: new Date().toISOString().split('T')[0],
              renewal_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
            })
          }
        );
        if (!visitorRes.ok) throw new Error("Failed to create Visitors member.");
        const data = await res.json();
        const createdChapter = {
          id: data._id,
          name: data.chapter_name,
          code: data.chapter_code,
          status: data.chapter_status ? "Active" : "Inactive",
          meetingDay: data.meeting_day,
          meetingTime: data.meeting_time,
          meetingLocation: data.meeting_location,
          meetingAddress: data.meeting_address,
        };
        setRegions(regions.map(region => {
          if (region.id === activeRegionId) {
            return {
              ...region,
              chapters: [...region.chapters, createdChapter]
            };
          }
          return region;
        }));
        setIsChapterModalOpen(false);
        if (!editingId) {
          setExpandedRegions(prev => ({ ...prev, [activeRegionId]: true }));
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Error creating chapter.");
      }
    }
  };

  const totalRegions = regions.length;
  const totalChapters = regions.reduce((acc, curr) => acc + curr.chapters.length, 0);

  // --- Chapter Card Click Handler ---
  const handleChapterCardClick = (chapterId) => {
    navigate(`/chapterdetails/${chapterId}`);
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="text-gray-900 dark:text-gray-100 font-sans selection:bg-yellow-200 dark:selection:bg-yellow-900 transition-colors duration-200 mb-10">
        {/* --- Main Dashboard Container --- */}
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* --- Heading Section (Formerly Header) --- */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-gray-200 dark:border-gray-700 pb-8">
            {/* Title & Stats */}
            <div className="space-y-4 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-3xl font-extrabold uppercase tracking-tight leading-none text-gray-900 dark:text-white">
                    Admin Operations
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">REGIONS: {totalRegions}</span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">CHAPTERS: {totalChapters}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Actions (Search, Toggle, Create) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64 group">
                <input
                  type="text"
                  placeholder="Search regions or chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-yellow-400 dark:focus:border-yellow-500 focus:outline-none transition-all shadow-sm"
                  disabled={loading}
                />
                <Search className="absolute left-3.5 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-yellow-500 transition-colors" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openRegionModal()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-red-600/20 whitespace-nowrap active:transform active:scale-95"
                  disabled={loading}
                  style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  <Plus size={20} />
                  Create Region
                </button>
              </div>
            </div>
          </div>
          {/* --- Content Area --- */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Building size={16} />
                <span className="text-sm font-bold uppercase tracking-wider">Network Structure</span>
              </div>
            </div>
            {error && (
              <div className="text-center py-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 font-semibold mb-4">
                {error}
              </div>
            )}
            {loading ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <Globe className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4 animate-spin" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading...</h3>
              </div>
            ) : filteredRegions.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <Globe className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No matching records found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search filters or create a new region.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRegions.map((region) => (
                  <div key={region.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 group">
                    {/* Region Header Card */}
                    <div className="border-l-8 border-red-600 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                      {/* Decorative Yellow accent */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-600/10 dark:to-transparent rounded-bl-full pointer-events-none"></div>
                      <div className="flex-1 z-10 space-y-3">
                        <div className="flex items-center gap-4">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{region.name}</h2>
                          <StatusBadge status={region.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-xs rounded border border-gray-200 dark:border-gray-600 font-bold">
                            {region.code}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Globe size={16} className="text-yellow-500 dark:text-yellow-400" />
                            <span className="font-medium">{region.country}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-600">
                            <span>|</span>
                            <span className="text-gray-500 dark:text-gray-400">{region.chapters.length} Chapters Active</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 z-10 pt-2 md:pt-0">
                        <button
                          onClick={() => openChapterModal(region.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors shadow-sm"
                          disabled={loading}
                          style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                        >
                          <Plus size={16} />
                          Add Chapter
                        </button>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-600 mx-2 hidden md:block"></div>
                        <button
                          onClick={() => openRegionModal(region)}
                          className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit Region"
                          disabled={loading}
                          style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => toggleRegion(region.id)}
                          className={`p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${expandedRegions[region.id] ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                          disabled={loading}
                          style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                        >
                          {expandedRegions[region.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>
                    {/* Chapters List (Accordion Content) */}
                    {expandedRegions[region.id] && (
                      <div className="bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-700 p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {region.chapters.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 dark:text-gray-500 italic text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-transparent">
                            No chapters established in this region yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {region.chapters.map(chapter => (
                              <div
                                key={chapter.id}
                                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-5 rounded-lg hover:border-gray-400 dark:hover:border-gray-400 transition-colors flex flex-col sm:flex-row justify-between group/chapter relative overflow-hidden shadow-sm cursor-pointer"
                                onClick={() => handleChapterCardClick(chapter.id)}
                              >
                                {/* Subtle Yellow Side strip on hover */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400 transform -translate-x-full group-hover/chapter:translate-x-0 transition-transform"></div>
                                <div className="pl-2 flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{chapter.name}</h3>
                                    <span className="text-xs bg-gray-900 dark:bg-gray-600 text-white px-2 py-0.5 rounded font-mono border border-transparent dark:border-gray-500">{chapter.code}</span>
                                    <StatusBadge status={chapter.status} />
                                  </div>
                                  <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                      <div className="w-6 flex justify-center"><Clock size={16} className="text-red-600 dark:text-red-500" /></div>
                                      <span className="font-medium">{chapter.meetingDay}s at {chapter.meetingTime}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                                      <div className="w-6 flex justify-center mt-0.5"><MapPin size={16} className="text-red-600 dark:text-red-500 flex-shrink-0" /></div>
                                      <div className="flex-1">
                                        <span className="block text-gray-700 dark:text-gray-200 font-bold">{chapter.meetingLocation}</span>
                                        <span className="text-xs block mb-1 opacity-80">{chapter.meetingAddress}</span>
                                        <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chapter.meetingAddress)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline mt-1"
                                          onClick={e => e.stopPropagation()}
                                        >
                                          View on Map <ExternalLink size={10} />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end gap-2 mt-5 sm:mt-0 sm:pl-5 sm:border-l border-gray-100 dark:border-gray-600">
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      openChapterModal(region.id, chapter);
                                    }}
                                    className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors flex items-center justify-center gap-1.5"
                                    disabled={loading}
                                    style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                  >
                                    <Edit2 size={12} /> Edit
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* --- Modals --- */}
        {/* 1. Create/Edit Region Modal */}
        {isRegionModalOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700">
              <div className="bg-black dark:bg-gray-900 text-white px-6 py-5 flex justify-between items-center border-b-4 border-red-600">
                <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                  {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                  {editingId ? 'Edit Region' : 'New Region Setup'}
                </h2>
                <button onClick={() => setIsRegionModalOpen(false)} className="text-gray-500 hover:text-white transition-colors" disabled={loading} style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>&times;</button>
              </div>
              <form onSubmit={handleRegionSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Region Name</label>
                  <input
                    required
                    type="text"
                    value={regionForm.name}
                    onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-400 dark:focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all placeholder-gray-400"
                    placeholder="e.g. London South"
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Region Code</label>
                    <input
                      required
                      type="text"
                      value={regionForm.code}
                      onChange={(e) => setRegionForm({ ...regionForm, code: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-400 dark:focus:border-yellow-500 focus:outline-none transition-all placeholder-gray-400"
                      placeholder="e.g. LON-S"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Country</label>
                    <input
                      required
                      type="text"
                      value={regionForm.country}
                      onChange={(e) => setRegionForm({ ...regionForm, country: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-yellow-400 dark:focus:border-yellow-500 focus:outline-none transition-all placeholder-gray-400"
                      placeholder="e.g. United Kingdom"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" onClick={() => setIsRegionModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" disabled={loading} style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 border-b-4 border-yellow-500 active:border-b-0 active:mt-1 transition-all" disabled={loading} style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                    {editingId ? 'Save Changes' : 'Create Region'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* 2. Create/Edit Chapter Modal */}
        {isChapterModalOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700">
              <div className="bg-yellow-400 dark:bg-yellow-500 text-black px-6 py-5 flex justify-between items-center">
                <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                  {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                  {editingId ? 'Edit Chapter Details' : 'Launch New Chapter'}
                </h2>
                <button onClick={() => setIsChapterModalOpen(false)} className="text-black/60 hover:text-black hover:bg-black/10 rounded-full p-1 transition-colors" disabled={loading} style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>&times;</button>
              </div>
              <form onSubmit={handleChapterSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Identity */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-500 uppercase border-b border-gray-200 dark:border-gray-700 pb-2">Chapter Identity</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Chapter Name</label>
                    <input
                      required
                      type="text"
                      value={chapterForm.name}
                      onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none transition-all placeholder-gray-400"
                      placeholder="e.g. Prosperity Creators"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Code</label>
                    <input
                      required
                      type="text"
                      value={chapterForm.code}
                      onChange={(e) => setChapterForm({ ...chapterForm, code: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none transition-all"
                      placeholder="e.g. PC-01"
                      disabled={loading}
                    />
                  </div>
                </div>
                {/* Right Column: Logistics */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-500 uppercase border-b border-gray-200 dark:border-gray-700 pb-2">Meeting Logistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Day</label>
                      <div className="relative">
                        <select
                          required
                          value={chapterForm.day}
                          onChange={(e) => setChapterForm({ ...chapterForm, day: e.target.value })}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg appearance-none focus:border-black dark:focus:border-white focus:outline-none cursor-pointer"
                          disabled={loading}
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <Calendar className="absolute right-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Time</label>
                      <input
                        required
                        type="time"
                        value={chapterForm.time}
                        onChange={(e) => setChapterForm({ ...chapterForm, time: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Venue Name</label>
                    <input
                      required
                      type="text"
                      value={chapterForm.location}
                      onChange={(e) => setChapterForm({ ...chapterForm, location: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none placeholder-gray-400"
                      placeholder="e.g. Grand Hotel"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Full Address</label>
                    <textarea
                      required
                      rows="2"
                      value={chapterForm.address}
                      onChange={(e) => setChapterForm({ ...chapterForm, address: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none text-sm placeholder-gray-400"
                      placeholder="Street, City, Zip"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                  <button type="button" onClick={() => setIsChapterModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" disabled={loading} style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all" disabled={loading} style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                    {editingId ? 'Update Chapter' : 'Launch Chapter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <br className='' />
    </div>
  );
}