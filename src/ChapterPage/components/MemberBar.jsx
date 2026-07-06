import ActivityField from "../../MyActivity/Components/ActivityField";

function Meeting({
  header = false,
  content = {
    sno: 1,
    direction: "Given",
    name: "yonesh Murugan",
    category: "Category Name",
    date: "20 Sept 2025",
    given: 201,
    received: 123,
    business: "25L",
  },
}) {
  if (header) {
    const headers = [
      "S.No",
      "Member Name",
      "Category",
      "Joined Date",
      "Referrals Given",
      "Referrals Received",
      "Business Generated",
    ];

    return (
      <div className="sticky top-0 bg-gradient-to-r from-yellow-300 to-yellow-400 shadow-md rounded-t-2xl select-none flex justify-around items-center py-3 w-max lg:w-full xl:w-full cursor-auto rounded-b-lg transition-colors ">
        {headers.map((element, index) => (
          <p
            key={index}
            className="min-w-[120px] mx-1.5 font-semibold text-gray-900 dark:text-gray-100 text-center text-nowrap"
          >
            {element}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-around items-center py-3 w-max lg:w-full xl:w-full cursor-auto rounded-b-lg transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900 even:bg-gray-50 dark:even:bg-gray-700 odd:bg-gray-100 dark:odd:bg-gray-800 shadow-sm select-text">
      <ActivityField data={content.sno} className="overflow-x-hidden font-semibold min-w-[120px] text-center" />
      <ActivityField data={content.name} className="font-bold min-w-[120px] text-center" />
      <ActivityField data={content.category} className="font-semibold min-w-[120px] text-center" />
      <ActivityField data={content.date} className="overflow-x-hidden min-w-[120px] text-center" />
      <ActivityField data={content.given} className="overflow-x-hidden font-semibold min-w-[120px] text-center" />
      <ActivityField data={content.received} className="overflow-x-hidden font-semibold min-w-[120px] text-center" />
      <ActivityField data={content.business} className="overflow-x-hidden font-semibold min-w-[120px] text-center" />
    </div>
  );
}

export default Meeting;
