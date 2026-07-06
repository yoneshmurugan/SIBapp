import Header from "../MainPage/Header";
import FullActivity from "./FullActivity";
import Hero from "./Hero";
import Stats from "./Stats";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getDate } from '../utils/getDate.mjs';
import Loader from '../Members/Components/Loader';
import Error from "../Members/Components/Error";

// --- Filter Pill ---
const Pill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap active:scale-95
      ${active
        ? 'bg-amber-400 text-amber-950 border-amber-400 shadow-sm'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent'
      }`}
  >
    {label}
  </button>
);

function MyActivity() {
  const todaysDate = getDate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL params (deep-link from dashboard)
  const [value,     setValue]     = useState(searchParams.get('type')      || 'all');
  const [direction, setDirection] = useState(searchParams.get('direction') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate,   setEndDate]   = useState(todaysDate);

  const [statdata, setStatdata] = useState({
    referral_given: 0, referral_received: 0,
    tyftb_given: 0, tyftb_received: 0,
    business_made: 0, M2Ms: 0, Visitors: 0
  });
  const [fullactivitydata, setFullactivitydata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatActivityData = (apiData) => {
    const formatted = [];

    if (apiData.tyftb && Array.isArray(apiData.tyftb)) {
      apiData.tyftb.forEach(item => {
        formatted.push({
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          type: 'TYB',
          direction: item.direction?.charAt(0).toUpperCase() + item.direction?.slice(1) || 'Unknown',
          directionRaw: item.direction,
          name: item.direction === 'given' ? (item.receiver?.name || 'Unknown') : (item.payer?.name || 'Unknown'),
          detail: item.business_description || `${item.business_type} - ₹${item.business_amount}`,
          status: item.status === true ? 'Approved' : 'Pending',
          fullDetails: item
        });
      });
    }

    if (apiData.referral && Array.isArray(apiData.referral)) {
      apiData.referral.forEach(item => {
        formatted.push({
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          type: 'REFERRAL',
          direction: item.direction?.charAt(0).toUpperCase() + item.direction?.slice(1) || 'Unknown',
          directionRaw: item.direction,
          name: item.direction === 'given' ? (item.referee?.name || item.contact_name || 'Unknown') : (item.referrer?.name || 'Unknown'),
          detail: item.description || item.contact_name || 'No description',
          status: item.status === true ? 'Approved' : 'Pending',
          fullDetails: item
        });
      });
    }

    if (apiData.m2m && Array.isArray(apiData.m2m)) {
      apiData.m2m.forEach(item => {
        formatted.push({
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          type: 'M2M',
          direction: item.direction?.charAt(0).toUpperCase() + item.direction?.slice(1) || 'Unknown',
          directionRaw: item.direction,
          name: item.direction === 'given' ? (item.member2?.name || 'Unknown') : (item.member1?.name || 'Unknown'),
          detail: item.location || item.discussion_points || 'One-to-One Meeting',
          status: item.status === true ? 'Confirmed' : 'Pending',
          fullDetails: item
        });
      });
    }

    formatted.sort((a, b) => new Date(b.date) - new Date(a.date));
    return formatted;
  };

  // Fetch summary stats
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ filter: value, startDate, endDate });
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/activity/getactivity?${params}`,
          { method: "GET", credentials: "include" }
        );
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        setStatdata(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [value, startDate, endDate]);

  // Fetch full detail records
  useEffect(() => {
    async function fetchFullActivityData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ type: value, startDate, endDate });
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/activity/getactivity-details?${params}`,
          { method: "GET", credentials: "include" }
        );
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const apiData = await response.json();
        setFullactivitydata(formatActivityData(apiData.data));
      } catch (err) {
        setError(err.message);
        setFullactivitydata([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFullActivityData();
  }, [value, startDate, endDate]);

  // Client-side filter by direction + status
  const filteredData = useMemo(() => {
    return fullactivitydata.filter(item => {
      const dirMatch  = direction    === 'all' || item.directionRaw === direction;
      const statMatch = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
      return dirMatch && statMatch;
    });
  }, [fullactivitydata, direction, statusFilter]);

  const typeOptions      = [{ value: 'all', label: 'All' }, { value: 'referral', label: 'Referral' }, { value: 'tyftb', label: 'TYB' }, { value: 'm2m', label: 'M to M' }];
  const directionOptions = [{ value: 'all', label: 'All' }, { value: 'given', label: 'Given' }, { value: 'received', label: 'Received' }];
  const statusOptions    = [{ value: 'all', label: 'All' }, { value: 'approved', label: 'Approved' }, { value: 'pending', label: 'Pending' }];

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen bg-stone-50 dark:bg-black/90 transition-colors duration-300">
      <div className="fixed top-0 left-0 w-full z-10 bg-transparent">
        <Header />
      </div>

      <main className="w-full max-w-5xl px-3 sm:px-6 md:px-10 text-gray-900 dark:text-gray-100 pt-[calc(120px+env(safe-area-inset-top,0px))] pb-20">

        {/* Type filter + date range (Hero) */}
        <section className="mb-4 w-full">
          <Hero
            value={value}
            setValue={setValue}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            userdata={filteredData}
          />
        </section>

        {/* Direction + Status filter pills */}
        <section className="mb-4 w-full bg-white dark:bg-gray-900 rounded-2xl border border-stone-100 dark:border-gray-800 p-4 shadow-sm flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Direction</p>
            <div className="flex gap-1.5 flex-wrap">
              {directionOptions.map(o => (
                <Pill key={o.value} label={o.label} active={direction === o.value} onClick={() => setDirection(o.value)} />
              ))}
            </div>
          </div>
          <div className="h-px bg-gray-100 dark:bg-gray-800" />
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</p>
            <div className="flex gap-1.5 flex-wrap">
              {statusOptions.map(o => (
                <Pill key={o.value} label={o.label} active={statusFilter === o.value} onClick={() => setStatusFilter(o.value)} />
              ))}
            </div>
          </div>
        </section>

        {/* Stats summary */}
        <section className="mb-4 w-full">
          {loading ? (
            <Loader text="Syncing Stats..." />
          ) : error ? (
            <Error message={error} />
          ) : (
            <Stats
              items={[
                { name: "Referrals Given",    value: statdata.referral_given },
                { name: "Referrals Received", value: statdata.referral_received },
                { name: "TYB Given",          value: statdata.tyftb_given },
                { name: "TYB Received",       value: statdata.tyftb_received },
                { name: "M2M Attended",       value: statdata.M2Ms },
              ]}
            />
          )}
        </section>

        {/* Full activity list (filtered) */}
        <section className="w-full">
          {loading ? <Loader text="Loading Records..." /> : error ? <Error /> : <FullActivity data={filteredData} />}
        </section>

      </main>
    </div>
  );
}

export default MyActivity;
