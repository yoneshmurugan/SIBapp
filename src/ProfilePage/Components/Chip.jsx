import { useState, useRef , useEffect} from "react";

const BUSINESS_VERTICALS = [
"FOOD & BEVERAGES",
"PHOTOGRAPHY & VIDEOGRAPHY",
"TEXTILE & GARMENTS",
"MEDICAL & HEALTHCARE",
"MANUFACTURING",
"BEAUTY & COSMETICS",
"INTERIOR DESIGN & DECORATION",
"CONSTRUCTION & BUILDING MATERIALS",
"HOME APPLIANCES & ELECTRONICS",
"ADVERTISING & MARKETING",
"EVENT MANAGEMENT",
"WATER PURIFICATION & TREATMENT",
"MATRIMONY SERVICES",
"TRAVEL & TOURISM",
"PERSONAL CARE PRODUCTS",
"INSURANCE",
"WELLNESS & FITNESS",
"ELECTRICAL SERVICES",
"GROCERIES & RETAIL",
"SOLAR ENERGY",
"FINANCIAL SERVICES",
"REAL ESTATE",
"FURNITURE & FURNISHINGS",
"AIR CONDITIONING & REFRIGERATION",
"FOOTWEAR & LEATHER GOODS",
"EDUCATION & TRAINING",
"HOSPITALITY & CATERING",
"SECURITY SYSTEMS",
"PRINTING & PUBLISHING",
"HR CONSULTING & MANPOWER",
"GLASS & GLAZING",
"AUTOMOBILE SERVICES",
"FASHION DESIGN",
"LEGAL SERVICES",
"COMPUTER SALES & SERVICE",
"FIRE & SAFETY",
"PLUMBING & SANITARY",
"PAINTS & COATINGS",
"HARDWARE & TOOLS",
"ORGANIC & NATURAL PRODUCTS",
"AGRICULTURE & FARMING",
"AUTOMOTIVE SALES & REPAIR",
"BANKING & INVESTMENT",
"COURIER & LOGISTICS",
"E-COMMERCE",
"PHARMACEUTICALS",
"STATIONERY & OFFICE SUPPLIES",
"TELECOMMUNICATIONS",
"LAUNDRY & DRY CLEANING",
"VETERINARY SERVICES",
"WASTE MANAGEMENT"
];

const Chip = ({
  children,
  editable,
  onChange,
  onDelete,
  isvertical,
}) => {
  const [inputValue, setInputValue] = useState(children);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const filteredOptions = BUSINESS_VERTICALS.filter((v) =>
    v.toLowerCase().includes((inputValue || "").toLowerCase())
  );

  const handleSelect = (val) => {
    setInputValue(val);
    setShowDropdown(false);
    onChange && onChange(val);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-200 shadow-sm transition-colors"
    >
      {editable ? (
        <>
          <input
            type="text"
            value={inputValue}
            onFocus={() => setShowDropdown(true)}
            onChange={e => {
              setInputValue(e.target.value);
              setShowDropdown(true);
              onChange && onChange(e.target.value);
            }}
            className="bg-transparent w-full focus:outline-none placeholder-gray-400"
            autoComplete="off"
          />
          {isvertical && showDropdown && (
            <div className="absolute z-20 top-full left-0 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl mt-1 shadow-lg max-h-40 overflow-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((val) => (
                  <div
                    key={val}
                    className="cursor-pointer px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-[11px] font-bold text-gray-700 dark:text-gray-300 transition-colors"
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSelect(val);
                    }}
                  >
                    {val}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-[11px] font-bold text-gray-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        children
      )}
      {editable && onDelete && (
        <button
          onClick={onDelete}
          className="ml-2 text-red-400 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/20 rounded-full w-4 h-4 flex items-center justify-center leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Chip;
