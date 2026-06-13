import ButtonUI from "./ButtonUi";
import Header from "../MainPage/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TYFTBSlip from "./TYFTBSlip";

function SubmitButtons() {
  const location = useLocation();
  const navigate = useNavigate();
  const [deepLinkData, setDeepLinkData] = useState(null);

  useEffect(() => {
    if (location.state?.action === 'OPEN_TYB') {
      setDeepLinkData(location.state.referrerName);
      // Clear state so it doesn't reopen on subsequent navigations
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  const buttonData = [
    { label: "Submit Referral", description: "Create new referral slip", component: "referral" },
    { label: "Submit TYB", description: "Create new referral slip", component: "tyftb" },
    { label: "Submit M to M", description: "Create new referral slip", component: "m2m" },
    // { label: "Submit Visitor", description: "Create new referral slip", component: "visitors" },
  ];

  return (
    <section className="w-full min-h-screen p-4   transition-colors duration-300">
      <Header />
      <div className="mx-auto max-w-6xl px-4 sm:py-10">
        <header className="mb-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Submit Actions</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Pick an action to continue.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {buttonData.map((button, index) => (
            <ButtonUI
              key={index}
              index={index}
              label={button.label}
              description={button.description}
              component={button.component}
            />
          ))}
        </div>
      </div>

      {deepLinkData && (
        <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeepLinkData(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full h-full max-w-[1600px] max-h-[100vh]">
              <div className="relative w-full h-full rounded-xl overflow-auto p-5 ">
                <TYFTBSlip onClose={() => setDeepLinkData(null)} prefillTo={deepLinkData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SubmitButtons;
