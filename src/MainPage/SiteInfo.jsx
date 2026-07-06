import SiteButtonUI from "./Components/SiteButtonUI"
import useFetch from "../hooks/useFetch";

function SiteInfo() {
  const { data, loading, error } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/getrenewaldate`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const Buttons = {
    renewalDate: (
      <SiteButtonUI
        content={
          error
            ? "Error"
            : loading
            ? "Loading..."
            : data
            ? data.renewal_date
            : "No data"
        }
      />
    ),
    website: (
      <SiteButtonUI
        need={false}
        content="SIB Website"
        color="text-red-500 dark:text-red-400"
        style2={{ fontWeight: "600", fontSize: "1rem" }}
        to="/"
      />
    ),
  };

  return (
    <div
      className="
        rounded-lg sm:rounded-xl lg:rounded-2xl
        grid place-items-center
        grid-cols-2
        gap-3 lg:gap-4
        w-full
        text-gray-900 dark:text-gray-100
        transition-colors duration-300
      "
    >
      {Buttons.renewalDate}
      {Buttons.website}
    </div>
  );
}

export default SiteInfo;