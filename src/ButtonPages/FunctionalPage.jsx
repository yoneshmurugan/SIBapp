import ButtonUI from "./ButtonUi";
import Header from "../MainPage/Header";

function SubmitButtons() {
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
    </section>
  );
}

export default SubmitButtons;
