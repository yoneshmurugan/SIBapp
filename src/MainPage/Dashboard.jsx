import Header from './Header.jsx';
import ChapterOverview from './ChapterOverview.jsx';
import SubmitButtons from './SubmitButtons.jsx';
import UpcomingEvents from './UpcomingEvents.jsx';
import Graphs from './Graphs.jsx';
import Activity from './Activity.jsx';
import UserInfo from './UserInfo.jsx';
import Siteinfo from './SiteInfo.jsx';
import usePushNotifications from '../hooks/usePushNotifications.jsx';

/**
 * Mobile-first dashboard layout.
 *
 * Ordering rationale:
 *  1. Header   — always visible, sticky
 *  2. UserInfo — who am I? (personal welcome)
 *  3. Chapter  — chapter stats at a glance
 *  4. Buttons  — primary actions (Referral / TYB / M2M)
 *  5. Graphs   — my weekly performance
 *  6. Events+Leadership — schedule & team
 *  7. Activity — recent history (scroll-down content)
 *  8. SiteInfo — chapter meta (least urgent)
 */
function Dashboard() {
  usePushNotifications();
  
  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-950">

      {/* ── Sticky Header ─────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-gray-100 dark:bg-gray-950 px-3 pt-3 pb-2 shadow-sm dark:shadow-none">
        <Header />
      </div>

      {/* ── Page Content — single scrollable column ─────────── */}
      <div className="px-3 pb-24 space-y-3 mt-1">

        {/* Who am I */}
        <UserInfo />

        {/* Chapter stats snapshot */}
        <ChapterOverview />

        {/* Quick action slips */}

        {/* My weekly graph */}
        <Graphs />
                <SubmitButtons />


        {/* Upcoming events & leadership */}
        <UpcomingEvents />

        {/* Activity feed */}
        <Activity />

        {/* Footer-level info */}
        <Siteinfo />

      </div>
    </div>
  );
}

export default Dashboard;