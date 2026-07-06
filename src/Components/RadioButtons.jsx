import { useId, useState } from "react";

export default function RadioButtons({
  value,
  onChange,
  label = "Radio Button",
  buttons = [
    { name: "Radio-1", value: "Value1" },
    { name: "Radio-2", value: "Value2" },
  ],
}) {
  const defaultValue = buttons[0]?.value ?? "";
  const [internal, setInternal] = useState(value ?? defaultValue);
  const groupName = useId();

  const current = value ?? internal;

  const setValue = (v) => {
    setInternal(v);
    onChange?.(v);
  };

  const buttonComponent = buttons.map((element, index) => (
    <label
      key={element.value ?? index}
      className="relative inline-flex items-center gap-2 cursor-pointer select-none text-gray-900 dark:text-gray-100"
    >
      <input
        type="radio"
        name={groupName}
        value={element.value}
        checked={current === element.value}
        onChange={() => setValue(element.value)}
        className="peer sr-only"
        aria-label={element.name}
      />
      <span
        aria-hidden="true"
        className={[
          "grid size-4 place-items-center rounded-full border transition-colors",
          "bg-white dark:bg-gray-800",
          current === element.value
            ? "border-blue-600 dark:border-blue-400"
            : "border-gray-300 dark:border-gray-600",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500 dark:peer-focus-visible:outline-blue-400",
        ].join(" ")}
      >
        <span
          className={[
            "block size-2 rounded-full transition-transform duration-150 ease-out",
            current === element.value
              ? "scale-100 bg-blue-600 dark:bg-blue-400"
              : "scale-0 bg-transparent",
          ].join(" ")}
        />
      </span>

      <span className="text-sm">{element.name}</span>
    </label>
  ));

  return (
    <fieldset className="w-full">
      <legend className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </legend>

      <div className="flex flex-wrap items-center gap-6">{buttonComponent}</div>
    </fieldset>
  );
}
