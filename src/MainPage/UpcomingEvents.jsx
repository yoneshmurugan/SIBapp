import { ArrowRight, Edit, Loader2, Calendar, MapPin, Clock, Users } from "lucide-react";
import Events from "./Components/Events";
import useFetch from "../hooks/useFetch";
import Loading from "../Components/Loading";
import { useEffect, useState, useMemo } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { EventsModal } from "../PresidentPortal/components/EventModal";
import { useNavigate } from "react-router-dom";
import CrossChapterSearch from "../Components/CrossSearch";

// --- Helper: Date Formatter ---
const formatDate = (dateString) => {
  if (!dateString) return { day: "", month: "", year: "", full: "" };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { day: "", month: "", year: "", full: dateString };

  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();

  const getSuffix = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  return {
    day,
    suffix: getSuffix(day),
    month,
    year,
    full: `${day}${getSuffix(day)} ${month} ${year}`
  };
};

// --- Coordinator Bulk Edit Modal ---
function CoordinatorBulkEditModal({ open, onClose, onSave, initial, loading, allProfiles }) {
  const [coords, setCoords] = useState([]);

  useEffect(() => {
    setCoords([...(initial || [])]);
  }, [initial]);

  const handleChange = (index, value) => {
    setCoords(prev =>
      prev.map((c, i) => (i === index ? { ...c, name: value } : c))
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-all duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={e => {
          e.preventDefault();
          onSave(coords);
        }} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {coords.map((coord, idx) => (
            <div key={coord.role} className="space-y-1.5">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                <CrossChapterSearch
                  label={`Select member for ${coord.role}`}
                  value={coord._selectedUsername || ""}
                  onChange={(val) => {
                    setCoords(prev => prev.map((c, i) => i === idx ? { ...c, _selectedUsername: val } : c));
                  }}
                  userstate={(rawUser) => {
                    if (rawUser) {
                      const formattedName = (rawUser.name || rawUser.display_name || rawUser.username || "").trim();
                      handleChange(idx, formattedName);
                    }
                  }}
                  offsubmit={true}
                />
                <div className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 rounded-lg flex items-center justify-between">
                   <span>Selected Name:</span>
                   <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{coord.name || "None"}</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30 py-3.5 px-4 rounded-xl text-sm font-bold transition-all transform active:scale-95 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : "Update Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Helper to X icon since it was missing in imports
const X = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Schedule Card Component ---
const ScheduleCard = ({ type, title, dateStr, time, location, iconColor }) => {
  const dt = formatDate(dateStr);
  return (
    <div className="group relative bg-white dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-900/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${iconColor}-500/5 rounded-full blur-2xl group-hover:bg-${iconColor}-500/10 transition-all`} />
      
      <div className="flex items-start gap-4">
        {/* Date Block */}
        <div className="flex flex-col items-center justify-center min-w-[60px] h-[64px] bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:border-amber-100 dark:group-hover:border-amber-800 transition-colors">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
            {dt.month}
          </span>
          <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
            {dt.day}
          </span>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500">
            {dt.year}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-${iconColor}-100 dark:bg-${iconColor}-900/30 text-${iconColor}-600 dark:text-${iconColor}-400`}>
              {type}
            </span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {title}
          </h4>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{time || "TBA"}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <MapPin className="w-3 h-3 text-red-400" />
                <span className="line-clamp-1">{location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Team Member Card ---
const TeamMemberCard = ({ name, role, profile }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (profile && profile._id && profile.user && profile.user._id) {
      navigate(`/profile/${profile._id}?user=${profile.user._id}`);
    }
  };

  return (
    <div 
      onClick={profile ? handleClick : undefined}
      className={`flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 transition-all group ${profile ? "cursor-pointer hover:border-amber-200 dark:hover:border-amber-900/30 hover:shadow-lg hover:shadow-amber-500/5" : ""}`}
    >
      {profile?.profile_image_url && profile.profile_image_url !== "N/A" ? (
        <img 
          src={profile.profile_image_url} 
          alt={name} 
          className="w-14 h-14 rounded-2xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl shadow-sm shrink-0">
          {name?.charAt(0) || "U"}
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">
          {role}
        </p>
        <p className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
          {name}
        </p>
      </div>
    </div>
  );
};

// --- Main Component ---
function UpcomingEvents() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: eventsData, loading: eventsLoading, error: eventsError } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/getupcomingevents`,
    { method: "GET", credentials: "include" }
  );

  const { data: meetingData, loading: meetingLoading, error: meetingError } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/meeting/getmeetings`,
    { method: "GET", credentials: "include" }
  );

  const { data: presidentData } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/caneditevents`,
    { method: "GET", credentials: "include" }
  );

  const {
    data: allEvents,
    loading: allEventsLoading,
    error: allEventsError,
  } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/event/getallevents`,
    { method: "GET", credentials: "include" }
  );

  const currentEvent = useMemo(() => 
    (!eventsLoading && !eventsError && Array.isArray(eventsData) && eventsData.length > 0) 
      ? eventsData[0] 
      : null, 
  [eventsData, eventsLoading, eventsError]);

  const currentMeeting = useMemo(() => 
    (!meetingLoading && !meetingError && Array.isArray(meetingData) && meetingData.length > 0)
      ? meetingData[0]
      : null, 
  [meetingData, meetingLoading, meetingError]);

  const { data: allProfiles, loading: profilesLoading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/profile/getallprofiles?sort=Name+A-Z&myChapterOnly=true`,
    { method: "GET", credentials: "include" }
  );

  const canEdit = presidentData?.hasaccess === true;

  const [coordinators, setCoordinators] = useState([]);
  const [coordLoading, setCoordLoading] = useState(false);
  const [coordError, setCoordError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [coordSuccess, setCoordSuccess] = useState(null);

  const loadCoordinators = async () => {
    setCoordLoading(true);
    setCoordError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/admin/coordinator/getcoordinators`,
        { method: "GET", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load coordinators");
      const json = await res.json();
      setCoordinators(Array.isArray(json) ? json : []);
    } catch (err) {
      setCoordError(err.message);
    } finally {
      setCoordLoading(false);
    }
  };

  useEffect(() => { loadCoordinators(); }, []);

  const handleEditClick = () => setEditModalOpen(true);

  const handleSaveAll = async (edits) => {
    setEditSaving(true);
    setCoordError(null);
    setCoordSuccess(null);
    try {
      await Promise.all(
        edits.map((edit) =>
          fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/admin/coordinator/updatecoordinatorsbyrole`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: edit.name, role: edit.role }),
            }
          ).then((res) => {
            if (!res.ok) throw new Error(`Failed for ${edit.role}`);
            return res;
          })
        )
      );
      setCoordSuccess("Team Updated Successfully");
      setEditModalOpen(false);
      await loadCoordinators();
    } catch (err) {
      setCoordError(err.message);
    } finally {
      setEditSaving(false);
      setTimeout(() => setCoordSuccess(null), 3000);
    }
  };

  const hasEvent = !!currentEvent;
  const hasMeeting = !!currentMeeting;
  const mainLoading = eventsLoading || meetingLoading;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* ─── Schedule Section ─── */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none transition-all">
        {/* Sub-Header */}
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/20 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Schedule</h3>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Upcoming Activities</p>
            </div>
          </div>
          
          {!allEventsLoading && allEvents && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all active:scale-95 group"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        <div className="p-5">
          {mainLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Calendar...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!hasEvent && !hasMeeting && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-40">
                  <Calendar className="w-12 h-12 mb-3 text-gray-400" />
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Your schedule is clear</p>
                </div>
              )}

              {hasEvent && (
                <ScheduleCard 
                  type="Special Event"
                  title={currentEvent.companyName}
                  dateStr={currentEvent.date}
                  time={currentEvent.time}
                  location={currentEvent.location || currentEvent.VATnumber}
                  iconColor="blue"
                />
              )}

              {hasMeeting && (
                <ScheduleCard 
                  type="Chapter Meeting"
                  title={currentMeeting.title}
                  dateStr={currentMeeting.meeting_date}
                  time={currentMeeting.meeting_time}
                  location={currentMeeting.location}
                  iconColor="amber"
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── Leadership Team Section ─── */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none transition-all">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/20 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Leadership</h3>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">The Core Team</p>
            </div>
          </div>
          
          {canEdit && (
            <button 
              onClick={handleEditClick}
              className="p-2 rounded-xl text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-90 transition-all border border-transparent hover:border-amber-100 dark:hover:border-amber-800"
            >
              <Edit size="18" />
            </button>
          )}
        </div>

        <div className="p-5">
          {coordLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="animate-spin text-amber-500 w-6 h-6" />
            </div>
          ) : coordError ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center gap-3">
              <BiErrorCircle className="text-red-500 w-5 h-5" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">{coordError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {coordSuccess && (
                <div className="col-span-full p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2 duration-500 border border-green-100 dark:border-green-800">
                  {coordSuccess}
                </div>
              )}
              
              {coordinators.map((coord, i) => {
                const nameMatch = coord.name?.trim().toLowerCase();
                const matchedProfile = allProfiles?.find((p) => {
                  const pName = p.display_name?.trim().toLowerCase() || "";
                  const pUser = p.user?.username?.trim().toLowerCase() || "";
                  return pName === nameMatch || pUser === nameMatch || (pName && nameMatch && pName.includes(nameMatch));
                });
                
                return (
                  <TeamMemberCard 
                    key={coord._id ?? i}
                    name={coord.name}
                    role={coord.role}
                    profile={matchedProfile}
                  />
                );
              })}
              
              {coordinators.length === 0 && (
                 <div className="col-span-full py-8 text-center">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-200 dark:text-gray-800" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No team assigned</p>
                 </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {allEvents && (
        <EventsModal
          events={allEvents}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      <CoordinatorBulkEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveAll}
        initial={coordinators}
        loading={editSaving}
        allProfiles={allProfiles}
      />
    </div>
  );
}

export default UpcomingEvents;