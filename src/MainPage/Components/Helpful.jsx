import { useState, useRef } from "react";

export default function Helpful({ content = "Helpful tooltip text", content2 = null, styles = "" }) {
  const [show, setShow] = useState(false);
  const tipRef = useRef(null);

  const handleMove = (e) => {
    if (!tipRef.current) return;
    const OFFSET = -30;
    tipRef.current.style.left = `${e.clientX + OFFSET - 100}px`;
    tipRef.current.style.top = `${e.clientY + OFFSET - 10}px`;
  };

  return (
    <>
      <p
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onMouseMove={handleMove}
        aria-describedby="cursor-tip"
        className={styles}
      >
        {content}
      </p>

      {content2 && (
        <span
          id="cursor-tip"
          ref={tipRef}
          role="tooltip"
          aria-hidden={!show}
          className={[
            "fixed z-[1000] select-none rounded-md px-2 py-1 text-xs shadow-lg whitespace-nowrap pointer-events-none",
            "bg-gray-500 text-white dark:bg-gray-700 dark:text-gray-200",
            show ? "opacity-100" : "opacity-0",
            "transition-opacity duration-200 ease-in-out"
          ].join(" ")}
        >
          {content2}
        </span>
      )}
    </>
  );
}
