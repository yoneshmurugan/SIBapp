import { PencilLine, Save, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Chip from "./Chip";

const COLORS = [
  "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-700/50",
  "bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:ring-orange-700/50",
  "bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:ring-yellow-700/50",
];

const VerticalChip = ({ children }) => {
  const [color] = useState(COLORS[Math.floor(Math.random() * COLORS.length)]);
  return (
    <div
      className={`rounded-md px-3 py-2 text-center text-sm font-semibold ring-1 ring-inset ${color}`}
    >
      {children}
    </div>
  );
};

const EditableField = ({
  label, value, editable, onChange, type = "text", isBigStat = false, isTitle = false
}) => {
  if (editable) {
    return (
      <div className="flex flex-col gap-1 w-full group transition-colors p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {label}
        </p>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="text-[13px] font-semibold w-full text-gray-900 dark:text-white border-b border-amber-200 dark:border-amber-900/50 focus:border-amber-500 bg-transparent px-0 py-1 outline-none transition-colors"
        />
      </div>
    );
  }

  // View Mode
  if (isBigStat) {
    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-800/30">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70 mb-1">
          {label}
        </p>
        <p className="text-2xl font-black text-amber-700 dark:text-amber-500">
          {value || "—"}
        </p>
      </div>
    );
  }

  if (isTitle) {
    return (
      <div className="flex flex-col w-full">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
          {label}
        </p>
        <h3 className="text-[18px] font-bold text-gray-900 dark:text-white leading-snug">
          {value || "Company Name"}
        </h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 p-3.5 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl w-full">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {label}
        </p>
      </div>
      <p className="text-[14px] font-bold text-gray-800 dark:text-gray-200 pl-3.5">
        {value || "—"}
      </p>
    </div>
  );
};

const normalizeUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

const EditableWeblink = ({ label, url, editable, onChange }) => {
  if (editable) {
    return (
      <div className="flex flex-col gap-1 w-full group transition-colors p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 overflow-x-clip">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {label}
        </p>
        <input
          type="text"
          value={url}
          onChange={e => onChange(e.target.value)}
          className="text-[13px] font-semibold w-full text-gray-900 dark:text-white border-b border-amber-200 dark:border-amber-900/50 focus:border-amber-500 bg-transparent px-0 py-1 outline-none transition-colors"
        />
      </div>
    );
  }

  // View Mode
  return (
    <div className="flex flex-col gap-1 w-full mt-2">
      {url ? (
        <a
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg w-fit"
          href={normalizeUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {url}
        </a>
      ) : (
        <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg w-fit">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          No Website Link
        </div>
      )}
    </div>
  );
};

const ProfessionalDetailsCard = ({
  datagiven = {
    company_name: "",
    website: "",
    years_in_business: "",
    annual_turnover: "",
    services: [],
    vertical_ids: [],
    ideal_referral: "",
    company: "",
    years: "",
    turnover: "",
    verticals: [],
    referral: "",
  },
  editable = false,
}) => {
  const initialData = {
    company_name: datagiven.company_name || datagiven.company || "",
    website: datagiven.website || "",
    years_in_business: datagiven.years_in_business ?? datagiven.years ?? "",
    annual_turnover: datagiven.annual_turnover ?? datagiven.turnover ?? "",
    services: datagiven.services ?? [],
    vertical_ids: datagiven.vertical_ids ?? datagiven.verticals ?? [],
    ideal_referral: datagiven.ideal_referral ?? datagiven.referral ?? "",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    setData(initialData);
  }, [datagiven]);

  const updateCompanyName = (value) => setData({ ...data, company_name: value });
  const updateWeblink = (value) => setData({ ...data, website: value });
  const updateYears = (value) => setData({ ...data, years_in_business: value });
  const updateTurnover = (value) => setData({ ...data, annual_turnover: value });

  const updateService = (index, value) => {
    const updated = [...data.services];
    updated[index] = value;
    setData({ ...data, services: updated });
  };

  const deleteService = (index) => {
    const updated = data.services.filter((_, i) => i !== index);
    setData({ ...data, services: updated });
  };

  const addService = () => setData({ ...data, services: [...data.services, ""] });

  const updateVertical = (index, value) => {
    const updated = [...data.vertical_ids];
    updated[index] = value;
    setData({ ...data, vertical_ids: updated });
  };

  const deleteVertical = (index) => {
    const updated = data.vertical_ids.filter((_, i) => i !== index);
    setData({ ...data, vertical_ids: updated });
  };

  const addVertical = () => setData({ ...data, vertical_ids: [...data.vertical_ids, ""] });

  const handleEditToggle = async () => {
    setError("");
    setResponse("");
    if (isEditing) {
      try {
        setLoading(true);
        const serverData = {
          company_name: data.company_name,
          website: data.website,
          years_in_business: Number(data.years_in_business) || 0,
          annual_turnover: Number(data.annual_turnover) || 0,
          services: data.services,
          vertical_ids: data.vertical_ids,
          ideal_referral: data.ideal_referral,
        };
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/profile/updateprofile`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serverData),
            credentials: "include",
          }
        );
        const result = await res.json();
        if (result?.errors || result?.message ) {
          const errMsg = result?.errors?.[0]
            ? `${result?.errors?.[0].path} : ${result?.errors?.[0].msg}`
            : (result?.message || "An error occurred.");
          setError(errMsg);
        } 
        else if(result?.error) setError(result?.error)
        else {
          setResponse("Professional details updated successfully.");
        }
      } catch (err) {
        setError("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    setIsEditing(prev => !prev);
  };

  return (
    <>
      {(loading || error || response) && (
        <div className="mb-2 text-center">
          {loading && <div className="text-blue-500 font-semibold">Saving changes...</div>}
          {error && <div className="text-red-500 font-semibold">{error}</div>}
          {response && !loading && !error && <div className="text-green-600 font-semibold">{response}</div>}
        </div>
      )}
      <section className="w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            Professional Details
          </h2>
          {editable && (
            <button
              type="button"
              onClick={handleEditToggle}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 active:scale-95 transition-all"
            >
              {isEditing ? <Save size={13} /> : <PencilLine size={13} />}
              {isEditing ? "Save" : "Edit"}
            </button>
          )}
        </div>

        <div className="mb-4 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
            BUSINESS VERTICALS
          </p>
          <div className="flex flex-wrap gap-2">
            {data.vertical_ids.map((v, i) =>
              isEditing ? (
                <Chip
                  key={i}
                  editable
                  onChange={val => updateVertical(i, val)}
                  onDelete={() => deleteVertical(i)}
                  isvertical={true}
                >{v}</Chip>
              ) : (
                <VerticalChip key={i}>{v}</VerticalChip>
              )
            )}
            {isEditing && (
              <button
                onClick={addVertical}
                className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 active:scale-95 transition-all"
              >
                <Plus size={12} /> Add
              </button>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isEditing ? 'gap-2 mb-4' : 'gap-4 mb-6'}`}>
          {!isEditing ? (
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <EditableField
                label="COMPANY NAME"
                value={data.company_name}
                editable={isEditing}
                onChange={updateCompanyName}
                isTitle={true}
              />
              <EditableWeblink
                label="Website"
                url={data.website}
                editable={isEditing}
                onChange={updateWeblink}
              />
            </div>
          ) : (
            <>
              <EditableField
                label="COMPANY NAME"
                value={data.company_name}
                editable={isEditing}
                onChange={updateCompanyName}
              />
              <EditableWeblink
                label="Website"
                url={data.website}
                editable={isEditing}
                onChange={updateWeblink}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <EditableField
              label="YEARS IN BUSINESS"
              value={data.years_in_business}
              editable={isEditing}
              onChange={updateYears}
              type="number"
              isBigStat={!isEditing}
            />
            <EditableField
              label="ANNUAL TURNOVER"
              value={data.annual_turnover}
              editable={isEditing}
              onChange={updateTurnover}
              type="number"
              isBigStat={!isEditing}
            />
          </div>
        </div>

        <div className={isEditing ? "space-y-3 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl mb-4" : "mb-6 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl"}>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500" />
            SERVICES OFFERED
          </p>
          <div className="flex flex-wrap gap-2">
            {data.services.map((s, i) => (
              <Chip
                key={i}
                editable={isEditing}
                onChange={val => updateService(i, val)}
                onDelete={() => deleteService(i)}
              >{s}</Chip>
            ))}
            {isEditing && (
              <button
                onClick={addService}
                className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 active:scale-95 transition-all"
              >
                <Plus size={12} /> Add
              </button>
            )}
            {!isEditing && data.services.length === 0 && (
              <p className="text-[13px] font-medium text-gray-500 italic">No services listed.</p>
            )}
          </div>
        </div>

        <div className={isEditing ? "bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl" : "p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/30"}>
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500" />
            IDEAL REFERRAL
          </p>
          {isEditing ? (
            <textarea
              value={data.ideal_referral}
              onChange={e => setData({ ...data, ideal_referral: e.target.value })}
              className="w-full rounded-xl bg-white dark:bg-gray-900 border-b border-amber-200 dark:border-amber-900/50 p-3 focus:outline-none focus:border-amber-500 text-[13px] font-medium"
              rows={4}
            />
          ) : (
            <p className="text-[14px] font-medium leading-relaxed text-gray-800 dark:text-gray-200 pl-3.5">
              {data.ideal_referral || <span className="italic text-gray-400">No ideal referral specified yet.</span>}
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default ProfessionalDetailsCard;
