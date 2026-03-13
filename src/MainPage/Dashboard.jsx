import ChapterOverview from './ChapterOverview.jsx'
import Header from './Header.jsx'
import Activity from './Activity.jsx'
import Siteinfo from './SiteInfo.jsx'
import UpcomingEvents from './UpcomingEvents.jsx'
import Graphs from './Graphs.jsx'
import SubmitButtons from './SubmitButtons.jsx'
import { User } from 'lucide-react'
import UserInfo from './UserInfo.jsx'


function Dashboard() {
  return (
    <div className="
      w-full min-h-screen 
      bg-gray-100 dark:bg-gray-950 
      p-2 sm:p-4 lg:p-6 
      gap-4 lg:gap-6
      grid grid-cols-1 md:grid-cols-12 
      auto-rows-min
    ">
      {/* Header: Full Width */}
      <div className="col-span-1 md:col-span-12 ">
        <Header />
      </div>

      {/* Main Content Area (Left Column on Desktop) */}
      <div className="col-span-1 md:col-span-12 lg:col-span-8 flex flex-col gap-4 lg:gap-6">
        <ChapterOverview />
        <UpcomingEvents />
        <Graphs />
      </div>

      {/* Sidebar Area (Right Column on Desktop) */}
      <div className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col gap-4 lg:gap-6">
        {/* New User Info Section */}
  
        
        <UserInfo />
        {/* Activity Section - Height adapts to content now */}
        <Activity />
        
        {/* Site Info moved to bottom */}
        <Siteinfo />
      </div>

      {/* Footer / Action Area */}
      <div className="col-span-1 md:col-span-12">
        <SubmitButtons />
      </div>
    </div>
  )
}

export default Dashboard