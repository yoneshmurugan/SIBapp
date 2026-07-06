import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

import Dashboard from './MainPage/Dashboard';
import Members from './Members/Members';
import Myactivity from './MyActivity/Myactivity';
import Meetings from './Meetings/Meetings';
import Mychapter from './ChapterPage/Mychapter';
import Profile from './ProfilePage/Profile';
import Settings from './Settings/Settings';
import NotFound404 from './Notfound/Notfound';
import FunctionalPage from './ButtonPages/FunctionalPage'
import SignInPage from './SigninPage/SignInPage';
import ProtectedRoute from './hooks/protectedRoute';
import LeaderboardPage from './MainPage/LeaderboardPage';
import ResetPassword from './ResetPassword/ResetPassword';
import NotificationsPage from './NotificationPanel/NotificationsPage';
import PresidentPortal from './PresidentPortal/PresidentPortal';
import MembersAnalytics from './MembersAnalytics/MembersAnalytics';
import Coordinatorsportal from './Coordinatorsportal/Coordinatorsportalpage';
import PresidentRoute from './hooks/PresidentRoute';
import NotEligibleRole from './Notfound/NotEligible';
import ErrorDisplay from './Notfound/ErrorDisplay';
import CoordinatorRoute from './hooks/CoordinatorRoute'
import CSAEPolicy from './Notfound/CSAEPolicy'
import PublicMembers from './Members/PublicMembers';
import WallOfWishes from './WallOfWishes/WallOfWishes';

import './index.css'
import MainPage from './src1/MainPage/MainPage';
import Album from './src1/MainPage/Album/Album';
import EventsMeetingsPage from './src1/MainPage/Eventsmeetings/Events';
import ExistingSession from './hooks/ExistingSession';
import Admin from './Admin/Admin';
import AdminRoute from './hooks/AdminRoute';
import ChapterDetails from './Admin/Chapterdetails.jsx';
import PrivacyPanel from "./Settings/components/PrivacyPanel";
import VersionChecker from './Components/VersionChecker';

// We must import Preferences here to read the native storage!
import { Preferences } from "@capacitor/preferences";

// --- THE CAPACITOR-SAFE FETCH OVERRIDE ---
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let url = typeof input === 'string' ? input : input.url;

  // 1. If it's NOT our backend (like Firebase), let it run untouched!
  if (!url || !url.includes('api.senguntharinbusiness.in')) {
    return originalFetch(input, init);
  }

  const newInit = init ? { ...init } : {};
  const plainHeaders = {};

  // 2. SAFELY EXTRACT HEADERS INTO A PLAIN OBJECT (Capacitor hates the Headers class)
  if (newInit.headers) {
    if (newInit.headers instanceof Headers) {
      newInit.headers.forEach((value, key) => {
        plainHeaders[key] = value;
      });
    } else if (Array.isArray(newInit.headers)) {
      newInit.headers.forEach(([key, value]) => {
        plainHeaders[key] = value;
      });
    } else {
      Object.assign(plainHeaders, newInit.headers);
    }
  }

  // 3. GET THE TOKEN FROM NATIVE STORAGE
  const { value: token } = await Preferences.get({ key: 'sib_session_token' });

  if (token && token !== "undefined" && token !== "null") {
    plainHeaders['Authorization'] = `Bearer ${token}`;
  }

  newInit.headers = plainHeaders;
  newInit.credentials = 'include';

  console.log("🚨 TRAP 2 (SAFE): Sending Headers ->", plainHeaders);

  return originalFetch(url, newInit);
};
// -----------------------------------------

const router = createBrowserRouter([
  {
    path: '/sib', element: <ExistingSession />, errorElement: <ErrorDisplay />
  },
  { path: '/signin', element: <SignInPage /> },
  { path: '/public-members', element: <PublicMembers /> },
  {path:'/privacy-policy', element:<PrivacyPanel />},
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorDisplay />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/members', element: <Members /> },
      { path: '/myactivity', element: <Myactivity /> },
      { path: '/meetings', element: <Meetings /> },
      { path: '/mychapter', element: <Mychapter /> },
      { path: '/settings', element: <Settings /> },
      { path: '/slips', element: <FunctionalPage /> },
      { path: '/profile', element: <Profile /> },
      { path: '/allnotifications', element: <NotificationsPage /> },
      { path: '/wall-of-wishes', element: <WallOfWishes /> },
      { path: '/leaderboard', element: <LeaderboardPage /> },
    ]
  },
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <Admin /> },
      { path: '/chapterdetails/:id', element: <ChapterDetails /> },
    ]
  },
  {
    element: <PresidentRoute />,
    children: [
      { path: '/presidentportal', element: <PresidentPortal /> },
    ]
  }, {
    element: <CoordinatorRoute />,
    children: [
      { path: '/memberdetailedanalytics', element: <MembersAnalytics /> },
      { path: '/coordinatorsportal', element: <Coordinatorsportal /> },
    ]
  },
  { path: '/profile/:id', element: <Profile /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/noteligible', element: <NotEligibleRole /> },
  { path: '/child-safety-standards', element: <CSAEPolicy /> },
  { path: '/', element: <MainPage /> },
  { path: '/album', element: <Album /> },
  {path:'/events-meetings', element:<EventsMeetingsPage />},
  { path: '*', element: <NotFound404 /> },
]);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <VersionChecker>
        <RouterProvider router={router} />
      </VersionChecker>
    </QueryClientProvider>
  </StrictMode>
);