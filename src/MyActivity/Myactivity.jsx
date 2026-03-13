import Header from "../MainPage/Header";
import FullActivity from "./FullActivity";
import Hero from "./Hero";
import Stats from "./Stats";
import { useEffect, useState } from "react";
import { getDate } from '../utils/getDate.mjs'
import Loader from '../Members/Components/Loader'
import Error from "../Members/Components/Error";


function MyActivity() {
  const todaysDate = getDate();
  const [value, setValue] = useState("all");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState(todaysDate);
  const [statdata, setStatdata] = useState({
    referral_given: 0,
    referral_received: 0,
    tyftb_given: 3,
    tyftb_received: 0,
    business_made: 0,
    M2Ms: 7,
    Visitors: 0
  });
  const [fullactivitydata, setFullactivitydata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatActivityData = (apiData) => {
    const formatted = [];

    if (apiData.tyftb && Array.isArray(apiData.tyftb)) {
      apiData.tyftb.forEach(item => {
        formatted.push({
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }) : 'N/A',
          type: 'TYB',
          direction: item.direction?.charAt(0).toUpperCase() + item.direction?.slice(1) || 'Unknown',
          name: item.direction === 'given' 
            ? (item.receiver.name || 'Unknown') 
            : (item.payer.name || 'Unknown'),
          detail: item.business_description || `${item.business_type} - ₹${item.business_amount}`,
          status: 'Approved', 
          fullDetails: item
        });
      });
    }

    if (apiData.referral && Array.isArray(apiData.referral)) {
      apiData.referral.forEach(item => {
        formatted.push({
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }) : 'N/A',
          type: 'REFERRAL',
          direction: item.direction?.charAt(0).toUpperCase() + item.direction?.slice(1) || 'Unknown',
          name: item.direction === 'given' 
            ? (item.referee?.name || item.contact_name || 'Unknown') 
            : (item.referrer?.name || 'Unknown'),
          detail: item.description || item.contact_name || 'No description',
          status: "Approved",
          fullDetails: item
        });
      });
    }

    if (apiData.m2m && Array.isArray(apiData.m2m)) {
      apiData.m2m.forEach(item => {
        formatted.push({
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }) : 'N/A',
          type: 'M2M',
          direction: item.direction?.charAt(0).toUpperCase() + item.direction?.slice(1) || 'Unknown',
          name: item.direction === 'given' 
            ? (item.member2?.name || 'Unknown') 
            : (item.member1?.name || 'Unknown'),
          detail: item.location || item.discussion_points || 'One-to-One Meeting',
          status: 'Completed',
          fullDetails: item
        });
      });
    }

    if (apiData.visitor && Array.isArray(apiData.visitor)) {
      apiData.visitor.forEach(item => {
        formatted.push({
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }) : 'N/A',
          type: 'Visitor',
          direction: 'Given',
          name: item.visitor_name || 'Unknown',
          detail: item.business_category || item.visitor_company || 'Visitor',
          status: item.converted_to_member ? 'Converted' : 'Pending',
          fullDetails: item
        });
      });
    }

    formatted.sort((a, b) => new Date(b.date) - new Date(a.date));
    return formatted;
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          filter: value,
          startDate: startDate,
          endDate: endDate
        });
        const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/activity/getactivity?${params.toString()}`, {
          method: "GET",
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setStatdata(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [value, startDate, endDate]);

  useEffect(() => {
    async function fetchFullActivityData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          type: value,
          startDate: startDate,
          endDate: endDate
        });
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/activity/getactivity-details?${params.toString()}`,
          {
            method: "GET",
            credentials: "include"
          }
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const apiData = await response.json();
        
        const formattedData = formatActivityData(apiData.data);
        setFullactivitydata(formattedData);
      } catch (err) {
        console.error('Error fetching full activity details:', err);
        setError(err.message);
        setFullactivitydata([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFullActivityData();
  }, [value, startDate, endDate]);

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-[calc(env(safe-area-inset-bottom)_+_1rem)]">
      
      {/* Header fixed to the absolute top edge */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Main content pushed down dynamically below the header + safe area */}
      <main className="mt-[calc(env(safe-area-inset-top)_+_10px)] w-full max-w-7xl px-3 sm:px-6 md:px-10 text-gray-900 dark:text-gray-100">
        <section className="mb-6 mr-3">
          <Hero
            value={value}
            setValue={setValue}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            userdata={fullactivitydata}
          />
        </section>

        <section className="mb-6 mr-3">
          {loading ? (
            <Loader />
          ) : error ? (
            <Error message={error} />
          ) : (
            <Stats
              items={[
                { name: "Referrals Given", value: statdata.referral_given },
                { name: "Referrals Received", value: statdata.referral_received },
                { name: "TYB Given Slip", value: statdata.tyftb_given },
                { name: "TYB Received Slip", value: statdata.tyftb_received },
                { name: "M2M Attended", value: statdata.M2Ms }
              ]}
            />
          )}
        </section>

        <section className=" mr-3">
          {loading ? <Loader /> : error ? <Error /> : <FullActivity data={fullactivitydata}/>}
        </section>
      </main>
    </div>
  );
}

export default MyActivity;