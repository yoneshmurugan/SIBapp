import { Suspense, lazy } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../MainPage/Header';
import MemberDetailedAnalyticsReport from './componetns/MemberAnalytics';
import { Users, TrendingUp, Share2, ArrowLeft, ArrowRight } from 'lucide-react';

const ReferralsTable = lazy(() => import('./componetns/ReferralOverview'));
const TYFTBTable = lazy(() => import('./componetns/Tyftboverview'));
const One2OneMeetingsTable = lazy(() => import('./componetns/M2moverview'));

function LoadingFallback({ title }) {
  return (
    <div className="w-full min-h-[350px] flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Loading {title}...
      </p>
    </div>
  );
}

function MemberDetailedAnalytics() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryView = searchParams.get('view');

  const activeView = location.pathname.endsWith('/mtom') || queryView === 'mtom'
    ? 'mtom'
    : location.pathname.endsWith('/tyb') || queryView === 'tyb'
    ? 'tyb'
    : location.pathname.endsWith('/referrals') || queryView === 'referrals'
    ? 'referrals'
    : null;

  return (
    <div className="w-full min-h-screen flex flex-col items-center transition-colors">
      <div className="sticky rounded-xl top-1 left-0 w-full z-20 bg-gray-50/70 dark:bg-gray-950/70 backdrop-blur-md">
        <Header />
      </div>

      <div className="w-full max-w-7xl flex flex-col items-center px-2 sm:px-4 md:px-6 lg:px-8 py-6 gap-8">
        {activeView ? (
          <div className="w-full flex flex-col gap-6">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm">
              <button
                type="button"
                onClick={() => navigate('/memberdetailedanalytics')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-800 dark:hover:text-amber-300 transition-colors w-fit"
              >
                <ArrowLeft size={18} />
                <span>Back to Members Analytics</span>
              </button>

              <div className="sm:text-right">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {activeView === 'mtom' && 'M to M Coordinator Overview'}
                  {activeView === 'tyb' && 'TYB Coordinator Overview'}
                  {activeView === 'referrals' && 'Referrals Coordinator Overview'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeView === 'mtom' && '1-to-1 Meetings Report & History'}
                  {activeView === 'tyb' && 'Thank You for the Business (TYFTB) Slips'}
                  {activeView === 'referrals' && 'Referrals Given & Received Detailed Slips'}
                </p>
              </div>
            </div>

            <div className="w-full">
              {activeView === 'mtom' && (
                <Suspense fallback={<LoadingFallback title="M to M Meetings Overview" />}>
                  <One2OneMeetingsTable />
                </Suspense>
              )}
              {activeView === 'tyb' && (
                <Suspense fallback={<LoadingFallback title="TYB Overview" />}>
                  <TYFTBTable />
                </Suspense>
              )}
              {activeView === 'referrals' && (
                <Suspense fallback={<LoadingFallback title="Referrals Overview" />}>
                  <ReferralsTable />
                </Suspense>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-8">
            {/* Coordinator Portals Navigation Buttons */}
            <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  Coordinator Overviews
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Access specialized coordinator reports and transaction slips individually
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* MtoM Coordinator */}
                <button
                  type="button"
                  onClick={() => navigate('/memberdetailedanalytics/mtom')}
                  className="flex items-center justify-between p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/70 to-white dark:from-amber-950/20 dark:to-gray-900 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-sm hover:shadow group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 group-hover:scale-105 transition-transform">
                      <Users size={22} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">
                        M to M Coordinator
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        1-to-1 Meetings
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* TYB Coordinator */}
                <button
                  type="button"
                  onClick={() => navigate('/memberdetailedanalytics/tyb')}
                  className="flex items-center justify-between p-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50/70 to-white dark:from-green-950/20 dark:to-gray-900 hover:border-green-400 dark:hover:border-green-500 transition-all shadow-sm hover:shadow group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-700 dark:text-green-300 group-hover:scale-105 transition-transform">
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">
                        TYB Coordinator
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        TYFTB Slips
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Referrals Coordinator */}
                <button
                  type="button"
                  onClick={() => navigate('/memberdetailedanalytics/referrals')}
                  className="flex items-center justify-between p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/70 to-white dark:from-blue-950/20 dark:to-gray-900 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
                      <Share2 size={22} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">
                        Referrals Coordinator
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Referral Slips
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Main Detailed Analytics Report */}
            <div className="w-full">
              <MemberDetailedAnalyticsReport />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberDetailedAnalytics;
