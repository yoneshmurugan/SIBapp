import Header from '../MainPage/Header'
import MemberDetailedAnalyticsReport from './componetns/MemberAnalytics'
import ReferralsTable from './componetns/ReferralOverview'
import TYFTBTable from './componetns/Tyftboverview'
import One2OneMeetingsTable from './componetns/M2moverview'

function MemberDetailedAnalytics() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center  transition-colors">
      <div className="sticky rounded-xl top-1 left-0 w-full z-20 bg-gray-50/70 dark:bg-gray-950/70 backdrop-blur-md">
        <Header />
      </div>
      <div className="w-full max-w-7xl flex flex-col items-center px-2 sm:px-4 md:px-6 lg:px-8 py-6 gap-12">
        <div className="w-full">
          <MemberDetailedAnalyticsReport />
        </div>
        <div className="w-full">
          <ReferralsTable />
        </div>
        <div className="w-full">
          <TYFTBTable />
        </div>
        <div className="w-full">
          <One2OneMeetingsTable />
        </div>
      </div>
    </div>
  );
}

export default MemberDetailedAnalytics;
