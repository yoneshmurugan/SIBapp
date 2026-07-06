import clsx from "clsx";

function ActivityField({
    classname = "",
    data = "Name"
}) {
  return (
    <p
      className={clsx(
        "min-w-[120px] max-w-[120px] text-nowrap text-center mx-2 overflow-x-hidden text-gray-900 dark:text-gray-100 transition-colors duration-300",
        classname
      )}
    >
      {data}
    </p>
  );
}

export default ActivityField;
