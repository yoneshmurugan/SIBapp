import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonUI from "./ButtonUi";
import Header from "../MainPage/Header";
import TYFTBSlip from "./TYFTBSlip";
import M2MSlip from "./M2MSlip";

function SubmitButtons() {
  const location = useLocation();
  const navigate = useNavigate();
  const [modalState, setModalState] = useState(null); // { type: 'tyb' | 'm2m', prefill: string }

  useEffect(() => {
    if (location.state?.action === 'OPEN_TYB') {
      setModalState({ type: 'tyb', prefill: location.state.referrerName || '' });
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.action === 'OPEN_M2M') {
      setModalState({ type: 'm2m', prefill: location.state.partnerName || '' });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const buttonData = [
    { label: "Submit Referral", description: "Create new referral slip", component: "referral" },
    { label: "Submit TYB", description: "Create new referral slip", component: "tyftb" },
    { label: "Submit M to M", description: "Create new referral slip", component: "m2m" },
    { label: "Submit Visitor", description: "Create new referral slip", component: "visitors" },
  ];

  return (
    <section className="w-full min-h-screen p-4 transition-colors duration-300">
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

      {modalState?.type === 'tyb' && (
        <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalState(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full h-full max-w-[1600px] max-h-[100vh]">
              <div className="relative w-full h-full rounded-xl overflow-auto p-5">
                <TYFTBSlip onClose={() => setModalState(null)} prefillTo={modalState.prefill} />
              </div>
            </div>
          </div>
        </div>
      )}

      {modalState?.type === 'm2m' && (
        <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalState(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full h-full max-w-[1600px] max-h-[100vh]">
              <div className="relative w-full h-full rounded-xl overflow-auto p-5">
                <M2MSlip onClose={() => setModalState(null)} prefillPartner={modalState.prefill} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SubmitButtons;
