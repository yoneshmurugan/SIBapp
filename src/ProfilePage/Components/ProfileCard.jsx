import { useEffect, useState } from "react";
import {
  Calendar,
  Heart,
  MailCheck,
  PencilLine,
  Phone,
  Pin,
  Save,
  User,
} from "lucide-react";

// Config defined outside component
const fieldConfig = [
  { key: "displayName", label: "Nickname", icon: <User size={20} />, type: "text" },
  { key: "phone", label: "Phone", icon: <Phone size={20} />, type: "text" },
  { key: "email", label: "Email", icon: <MailCheck size={20} />, type: "text" },
  { 
    key: "address", 
    label: "Address", 
    icon: <Pin size={20} />, 
    colSpan: 2, 
    type: "text",
    // Allow address to wrap and show fully
    valueClass: "whitespace-normal" 
  }, 
  { key: "dob", label: "DOB", icon: <Calendar size={20} />, type: "date" },
  { key: "wedding", label: "Wedding Date", icon: <Calendar size={20} />, type: "date" },
  { key: "bloodGroup", label: "Blood Group", icon: <Heart size={20} />, type: "text" },
  // Tamil fields - Icons omitted to test alignment
  { key: "subCaste", label: "வகையறா", type: "text" },
  { key: "gothram", label: "கூட்டம்", type: "text" },
  { key: "motherTongue", label: "ஊர்", type: "text" },
  { key: "kuladeivam", label: "குலதெய்வம்", valueClass: "text-rose-600", colSpan: 2, type: "text" },
];

const DetailRow = ({
  icon,
  label,
  value,
  valueClass = "",
  editable = false,
  onChange,
  type = "text",
}) => {
  if (editable) {
    return (
      <div className="flex flex-col gap-1 w-full group transition-colors p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {label}
        </p>
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange && onChange(e.target.value)}
          className={`text-[13px] font-semibold w-full text-gray-900 dark:text-white ${valueClass} border-b border-amber-200 dark:border-amber-900/50 focus:border-amber-500 bg-transparent px-0 py-1 outline-none transition-colors`}
        />
      </div>
    );
  }

  // View Mode
  return (
    <div className="flex items-start gap-4 py-2 border-b border-gray-100/50 dark:border-gray-800/50 last:border-0">
      <div className="mt-1 shrink-0 text-amber-500/80 dark:text-amber-400/80">
        {icon || <div className="w-5 h-5" />} 
      </div>
      <div className="flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
          {label}
        </p>
        <p className={`text-[14px] font-medium text-gray-800 dark:text-gray-200 leading-snug ${valueClass}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
};

const ProfileCard = ({
  data = {
    displayName: "John Smith",
    phone: "+91 98765 43210",
    email: "john.smith@email.com",
    address: "123, Main Street, Erode, Tamil Nadu, 638001, India",
    dob: "1985-08-15",
    wedding: "2010-12-10",
    bloodGroup: "O+",
    motherTongue: "பெருந்துறை",
    subCaste: "Example வகையறா",
    kuladeivam: "அங்காளம்மன்",
    gothram: "செம்பூததான்",
  },
  editable = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (key, value) => {
    setLocalData((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditToggle = async () => {
    setStatus({ type: "", message: "" });

    if (isEditing) {
      try {
        setLoading(true);
        const serverData = {
          display_name: localData.displayName,
          company_phone: localData.phone,
          company_email: localData.email,
          company_address: localData.address,
          dob: localData.dob,
          wedding_date: localData.wedding,
          blood_group: localData.bloodGroup,
          native_place: localData.motherTongue,
          vagai_category: localData.subCaste,
          kuladeivam: localData.kuladeivam,
          kulam_category: localData.gothram,
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

        if (result?.errors || (result?.message && !res.ok)) {
            const errMsg = result?.errors?.[0]
            ? `${result?.errors?.[0].path} : ${result?.errors?.[0].msg}`
            : (result?.message || "An error occurred.");
          setStatus({ type: "error", message: errMsg });
          setLoading(false);
          return; 
        } else {
          setStatus({ type: "success", message: "Profile updated successfully." });
        }
      } catch (err) {
        setStatus({ type: "error", message: err.message });
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }
    
    setIsEditing((prev) => !prev);
  };

  const renderFields = (fields) => (
    <div className="grid grid-cols-1 gap-2">
      {fields.map((field) => (
        <div key={field.key} className="min-w-0">
          <DetailRow
            editable={isEditing}
            icon={field.icon}
            label={field.label}
            value={localData[field.key]}
            valueClass={field.valueClass}
            type={field.type}
            onChange={(val) => handleChange(field.key, val)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      {(loading || status.message) && (
        <div className="mb-4 text-center text-xs font-bold animate-fade-in">
          {loading && <div className="text-amber-500">Saving changes...</div>}
          {!loading && status.type === "error" && (
            <div className="text-red-500 bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{status.message}</div>
          )}
          {!loading && status.type === "success" && (
            <div className="text-green-600 bg-green-50 dark:bg-green-900/20 py-2 rounded-lg">{status.message}</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">
          Personal Details
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

      {/* Basic Contact Info */}
      <div className={isEditing ? "bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-2 mb-4" : "mb-6"}>
        {renderFields(fieldConfig.slice(0, 4))}
      </div>

      {/* Personal Info */}
      <div className={isEditing ? "bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-2" : ""}>
        {renderFields(fieldConfig.slice(4))}
      </div>
    </section>
  );
};

export default ProfileCard;