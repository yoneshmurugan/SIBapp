import ChapterOverview from './ChapterOverview.jsx'
import Header from './Header.jsx'
import Activity from './Activity.jsx'
import Siteinfo from './SiteInfo.jsx'
import UpcomingEvents from './UpcomingEvents.jsx'
import Graphs from './Graphs.jsx'
import SubmitButtons from './SubmitButtons.jsx'
import { User } from 'lucide-react'
import UserInfo from './UserInfo.jsx'
import LeaderboardTeaser from './LeaderboardTeaser.jsx'


function Dashboard() {
  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="
        max-w-7xl mx-auto
        p-3 sm:p-4 lg:p-6 
        gap-4 lg:gap-6
        grid grid-cols-1 md:grid-cols-12 
        auto-rows-min
      ">
        {/* Header: Full Width */}
        <div className="col-span-1 md:col-span-12 sticky top-0 z-50 bg-gray-100 dark:bg-gray-950/90 backdrop-blur-sm pb-2">
          <Header />
        </div>

        {/* Main Content Area (Left Column on Desktop) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 flex flex-col gap-4 lg:gap-6">
          <div className="lg:hidden">
            <UserInfo />
          </div>
          <ChapterOverview />
          <LeaderboardTeaser />
          <Graphs />
          <div className="lg:hidden">
            <SubmitButtons />
          </div>
          <UpcomingEvents />
        </div>

        {/* Sidebar Area (Right Column on Desktop) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col gap-4 lg:gap-6">
          <div className="hidden lg:block">
            <UserInfo />
          </div>
          <div className="hidden lg:block">
            <SubmitButtons />
          </div>
          <Activity />
          <Siteinfo />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;