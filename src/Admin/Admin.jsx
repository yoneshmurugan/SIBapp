import Stats from './Components/Stat'
import StatTable from './Components/StatTable'
import LineGraph from './Components/LineGraph'
import Graph from './Components/Graph'
import RegionChapterManager from './Components/AdminRegion'
import AlertSystem from './Components/AlertSystem'
import { useState } from 'react'
import PhotoGallery from '../Coordinatorsportal/components/PhotoGall'
import { Image } from 'lucide-react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import classNames from '../utils/classname'



export default function Admin() {
  const [showGallery, setShowGallery] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const logoutUrl = `${import.meta.env.VITE_BACKEND_SERVER}/auth/sessionLogout`;
  const logoutOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  if (showGallery) {
    return <PhotoGallery onBack={() => setShowGallery(false)} />;
  }

  async function onLogout() {
    try {
      setLoading(true);

      const fcmToken = localStorage.getItem('fcmToken');
      if (fcmToken) {
        try {
          await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/remove-fcm-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fcmToken })
          });
        } catch (e) {
          console.error('Failed to remove fcm token', e);
        }
      }

      const response = await fetch(logoutUrl, logoutOptions);
      const data = await response.json();

      if (data.message === "Logged out") {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/");
      } else {
        alert(`Logout failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full  transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6 flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">Admin Portal</h1>
          <div className="border-t border-neutral-100 dark:border-neutral-700">
            <button
              role="menuitem"
              onClick={onLogout}
              disabled={loading}
              className={classNames(
                "flex w-full items-center gap-2 px-3 py-2 text-rose-600 bg-rose-100 dark:bg-rose-700/20 hover:bg-rose-50 dark:hover:bg-rose-700/30 transition duration-150 rounded-md text-sm font-medium",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 text-rose-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>{loading ? "Logging out..." : "Sign out"}</span>
            </button>
          </div>
        </div>
        <Stats />
        <RegionChapterManager />
        <StatTable />
        <div className="mt-15 max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold dark:text-white">Reports</h1>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <LineGraph />
          <Graph />
        </div>
        <div className="-mt-60 grid place-items-center max-w-7xl mx-auto grid-cols-1 md:grid-cols-2">
          <AlertSystem />
          <div className='h-full mt-30'>
            <div className="w-full max-w-lg p-12 rounded-3xl border shadow-xl transition-all duration-300
                        flex flex-col items-center text-center gap-8
                        /* Light Mode */
                        bg-white border-gray-100 
                        /* Dark Mode */
                        dark:bg-gray-800 dark:border-gray-700">

              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Event Gallery
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-300 leading-relaxed">
                  Explore our complete collection of memorable moments.
                  Browse and share high-quality images from all our latest events in one place.
                </p>
              </div>

              <button
                onClick={() => setShowGallery(true)}
                className="flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95
            /* Button Colors */
            bg-emerald-600 hover:bg-emerald-700 
            dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Image size={28} />
                Open Gallery 
              </button>
              <div className="w-full flex flex-col items-center gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Community & Members
              </h3>
              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
Connect with the people who make our events special and discover the members behind every powerful referral              </p>
            </div>

            <button
              onClick={() => window.location.href = '/public-members'}
              className="flex items-center gap-3 px-6 py-3 rounded-xl text-base font-bold text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95
              /* Button Colors - Blue to distinguish from Gallery */
              bg-blue-600 hover:bg-blue-700 
              dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              View Members
            </button>
          </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}