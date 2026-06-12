import { useState, useRef, useEffect } from "react";
import { Phone, Mail, MapPin, User, Calendar, DollarSign, Tag, Users, MessageSquare, AlertCircle, FileText, X, Share2, ChevronUp, Clock } from "lucide-react";
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/* ─── helpers ─────────────────────────────────────────── */
const safeGet = (obj, path, def = "N/A") => {
  try { const v = path.split(".").reduce((a, k) => a?.[k], obj); return v ?? def; }
  catch { return def; }
};

const fmtDate = (d) => {
  try { return d ? new Date(d).toLocaleDateString("en-IN", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }) : "N/A"; }
  catch { return "N/A"; }
};

const fmtCurrency = (a) => {
  const n = parseFloat(a?.$numberDecimal ?? a ?? 0);
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 });
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => resolve(reader.result.split(",")[1]);
  reader.readAsDataURL(blob);
});

const hotLabel = { hot:"🌶️ Hot", warm:"☀️ Warm", cold:"🌤️ Cold" };

const statusBadge = (s) => {
  const map = {
    pending:    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    approved:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    confirmed:  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    completed:  "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    rejected:   "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    given_card: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    told_to_call:"bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
  };
  return map[s?.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
};

/* ─── re-usable section card ──────────────────────────── */
const Section = ({ title, icon: Icon, accentColor = "amber", children }) => (
  <div className={`rounded-2xl border bg-white dark:bg-gray-800/60 border-${accentColor}-200 dark:border-${accentColor}-800/50 overflow-hidden`}>
    <div className={`flex items-center gap-2 px-4 py-3 bg-${accentColor}-50 dark:bg-${accentColor}-900/20 border-b border-${accentColor}-100 dark:border-${accentColor}-800/40`}>
      <Icon className={`w-4 h-4 text-${accentColor}-600 dark:text-${accentColor}-400`} />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">{title}</span>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5 break-words">{value || "N/A"}</span>
  </div>
);

/* ─── slip renderers ──────────────────────────────────── */
const RenderTYFTB = ({ data }) => (
  <div className="space-y-4">
    <div className="text-center p-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl text-white">
      <p className="text-xs font-bold uppercase tracking-widest opacity-80">Business Amount</p>
      <p className="text-4xl font-black mt-1">{fmtCurrency(data.business_amount)}</p>
    </div>
    <Section title="From" icon={User} accentColor="amber">
      <div className="grid grid-cols-2 gap-3">
        <Row label="Name" value={safeGet(data,"payer.name")} />
        <Row label="Email" value={safeGet(data,"payer.email")} />
      </div>
    </Section>
    <Section title="To" icon={User} accentColor="rose">
      <div className="grid grid-cols-2 gap-3">
        <Row label="Name" value={safeGet(data,"receiver.name")} />
        <Row label="Email" value={safeGet(data,"receiver.email")} />
      </div>
    </Section>
    <Section title="Business Details" icon={Tag} accentColor="amber">
      <div className="grid grid-cols-2 gap-3">
        <Row label="Type" value={safeGet(data,"business_type")} />
        <Row label="Referral Type" value={safeGet(data,"referral_type")} />
      </div>
      <Row label="Description" value={safeGet(data,"business_description","No description")} />
    </Section>
    <div className="grid grid-cols-2 gap-3 px-1">
      <Row label="Created" value={fmtDate(safeGet(data,"created_at"))} />
      <Row label="Direction" value={safeGet(data,"direction")} />
    </div>
  </div>
);

const RenderReferral = ({ data }) => (
  <div className="space-y-4">
    {data.hot && data.hot !== "N/A" && (
      <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="font-bold text-red-700 dark:text-red-300">{hotLabel[data.hot] || data.hot}</span>
      </div>
    )}
    {Array.isArray(data.referral_status) && data.referral_status.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {data.referral_status.map((s,i) => (
          <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(s)}`}>
            {s.replace(/_/g," ").toUpperCase()}
          </span>
        ))}
      </div>
    )}
    <Section title="Referrer (Source)" icon={User} accentColor="amber">
      <div className="grid grid-cols-2 gap-3">
        <Row label="Name" value={safeGet(data,"referrer.name")} />
        <Row label="Email" value={safeGet(data,"referrer.email")} />
      </div>
    </Section>
    <Section title="Referee (Target)" icon={User} accentColor="rose">
      <div className="grid grid-cols-2 gap-3">
        <Row label="Name" value={safeGet(data,"referee.name")} />
        <Row label="Email" value={safeGet(data,"referee.email")} />
      </div>
    </Section>
    {(data.contact_name || data.contact_phone || data.contact_email || data.contact_address) && (
      <Section title="Contact Information" icon={Phone} accentColor="sky">
        {data.contact_name  && <Row label="Name"    value={data.contact_name} />}
        {data.contact_phone && <Row label="Phone"   value={data.contact_phone} />}
        {data.contact_email && <Row label="Email"   value={data.contact_email} />}
        {data.contact_address && <Row label="Address" value={data.contact_address} />}
      </Section>
    )}
    <Section title="Referral Details" icon={FileText} accentColor="amber">
      <Row label="Type" value={safeGet(data,"referral_type")} />
      <Row label="Description" value={safeGet(data,"description","No description")} />
    </Section>
    <div className="grid grid-cols-2 gap-3 px-1">
      <Row label="Created" value={fmtDate(safeGet(data,"created_at"))} />
      <Row label="Direction" value={safeGet(data,"direction")} />
    </div>
  </div>
);

const RenderM2M = ({ data }) => (
  <div className="space-y-4">
    {safeGet(data,"image_url","") !== "N/A" && safeGet(data,"image_url","") !== "" && (
      <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-gray-700">
        <img src={safeGet(data,"image_url")} alt="Meeting Photo" className="w-full object-cover max-h-48" />
      </div>
    )}
    <Section title="Member 1" icon={Users} accentColor="amber">
      <div className="grid grid-cols-2 gap-3">
        <Row label="Name" value={safeGet(data,"member1.name")} />
        <Row label="Email" value={safeGet(data,"member1.email")} />
      </div>
    </Section>
    <Section title="Member 2" icon={Users} accentColor="rose">
      <div className="grid grid-cols-2 gap-3">
        <Row label="Name" value={safeGet(data,"member2.name")} />
        <Row label="Email" value={safeGet(data,"member2.email")} />
      </div>
    </Section>
    <Section title="Meeting Details" icon={Calendar} accentColor="sky">
      <Row label="Date" value={fmtDate(safeGet(data,"meeting_date"))} />
      <Row label="Location" value={safeGet(data,"location")} />
      <Row label="Discussion Points" value={safeGet(data,"discussion_points","No discussion points")} />
    </Section>
    <div className="grid grid-cols-2 gap-3 px-1">
      <Row label="Submitted" value={fmtDate(safeGet(data,"createdAt"))} />
      <Row label="Direction" value={safeGet(data,"direction")} />
    </div>
  </div>
);

/* ─── share helper ────────────────────────────────────── */
const buildShareText = (content) => {
  if (!content) return "";
  const type = content.type?.toUpperCase();
  const lines = [`📋 SIB ${type} Slip`];
  if (content.direction) lines.push(`Direction: ${content.direction}`);
  if (content.payer?.name || content.member1?.name || content.referrer?.name)
    lines.push(`From: ${content.payer?.name || content.member1?.name || content.referrer?.name || "N/A"}`);
  if (content.receiver?.name || content.member2?.name || content.referee?.name)
    lines.push(`To: ${content.receiver?.name || content.member2?.name || content.referee?.name || "N/A"}`);
  if (content.business_amount) lines.push(`Amount: ${fmtCurrency(content.business_amount)}`);
  if (content.description) lines.push(`Description: ${content.description}`);
  if (content.business_description) lines.push(`Description: ${content.business_description}`);
  if (content.location) lines.push(`Location: ${content.location}`);
  if (content.meeting_date) lines.push(`Date: ${fmtDate(content.meeting_date)}`);
  if (content.discussion_points) lines.push(`Discussion: ${content.discussion_points}`);
  lines.push(`\nGenerated by SIB App`);
  return lines.join("\n");
};

/* ─── API route map ───────────────────────────────────── */
const API = {
  tyftb:   { delete: "slips/tyftb/deletetyftbbyid",   update: "slips/tyftb/updatetyftbbyid" },
  referral:{ delete: "slips/referral/deleterefferalbyid", update: "slips/referral/updaterefferalbyid" },
  m2m:     { delete: "slips/one2one/deleteone2onebyid",update: "slips/one2one/updateone2onebyid" },
};

/* ─── Editable fields per type ────────────────────────── */
const editableFields = {
  tyftb: [
    { key: "business_description", label: "Description", type: "text" },
    { key: "business_amount",      label: "Amount (₹)",  type: "number" },
    { key: "business_type",        label: "Business Type", type: "text" },
  ],
  referral: [
    { key: "description",   label: "Description",  type: "text" },
    { key: "contact_name",  label: "Contact Name", type: "text" },
    { key: "contact_phone", label: "Phone",        type: "tel" },
    { key: "contact_email", label: "Email",        type: "email" },
  ],
  m2m: [
    { key: "location",         label: "Location",         type: "text" },
    { key: "discussion_points",label: "Discussion Points", type: "text" },
  ],
};

/* ─── main component ──────────────────────────────────── */
export function ModalViewer({ content = {}, onAction }) {
  const [open, setOpen]             = useState(false);
  const [view, setView]             = useState("detail"); // "detail" | "edit" | "confirmDelete"
  const [editData, setEditData]     = useState({});
  const [actionLoading, setLoading] = useState(false);
  const [actionError, setError]     = useState(null);

  const isPending = content.status === false || content.status === undefined;

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const openModal = () => {
    setView("detail");
    setError(null);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setView("detail");
    setError(null);
  };

  const typeLabels = { tyb:"TYB Slip", tyftb:"TYB Slip", referral:"Referral", m2m:"One-to-One Meeting" };
  const type  = content.type?.toLowerCase();
  const label = typeLabels[type] || "Slip Details";
  const id    = content._id;

  /* ── Share ── */
  const handleShare = async () => {
    const text = buildShareText(content);
    const title = `SIB ${label}`;

    // Native Android share
    if (Capacitor.isNativePlatform()) {
      let files = [];
      let shareText = text;

      // Always append the image URL to the text, so you never lose the link!
      if (type === "m2m" && content.image_url && content.image_url.startsWith('http')) {
        shareText = text + `\n\nImage Link: ${content.image_url}`;
        
        try {
          // encode URI to handle spaces in Firebase Storage paths
          const safeUrl = encodeURI(content.image_url);
          console.log("[Share] Native downloading image:", safeUrl);
          
          const fileName = `m2m_${Date.now()}.jpg`;
          
          // Download directly to device cache
          await Filesystem.downloadFile({
            url: safeUrl,
            path: fileName,
            directory: Directory.Cache
          });
          
          // CRITICAL: The Share plugin needs a formatted `file://` URI, not an absolute path.
          const uriResult = await Filesystem.getUri({
            path: fileName,
            directory: Directory.Cache
          });
          
          console.log("[Share] Valid file URI:", uriResult.uri);
          files = [uriResult.uri];
        } catch (err) {
          console.error("[Share] Native image download failed:", err);
        }
      }

      try {
        const shareOptions = { title, text: shareText };
        if (files.length > 0) {
          shareOptions.files = files;
        }
        await Share.share(shareOptions);
      } catch (e) {
        console.error("[Share] Share.share failed:", e);
        // last-resort: text only
        try { await Share.share({ title, text: shareText }); } catch (_) {}
      }
      return;
    }

    // Web Fallback
    if (navigator.share) {
      try {
        const shareData = { title, text };
        if (type === "m2m" && content.image_url && content.image_url !== "N/A" && content.image_url !== "") {
          try {
            const response = await fetch(content.image_url);
            const blob = await response.blob();
            const file = new File([blob], "meeting_photo.jpg", { type: blob.type });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (err) { console.error(err); }
        }
        await navigator.share(shareData);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Details copied to clipboard!");
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!API[type]) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/${API[type].delete}/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }
      closeModal();
      onAction?.(); // tell parent to refresh
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Edit open ── */
  const openEdit = () => {
    const fields = editableFields[type] || [];
    const initial = {};
    fields.forEach(f => { initial[f.key] = content[f.key] ?? ""; });
    setEditData(initial);
    setError(null);
    setView("edit");
  };

  /* ── Edit save ── */
  const handleSave = async () => {
    if (!API[type]) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/${API[type].update}/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData)
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
      closeModal();
      onAction?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Render body ── */
  const renderBody = () => {
    switch (type) {
      case "tyb":
      case "tyftb":    return <RenderTYFTB data={content} />;
      case "referral": return <RenderReferral data={content} />;
      case "m2m":      return <RenderM2M data={content} />;
      default:         return <p className="text-center text-gray-400 py-8">No details available.</p>;
    }
  };

  const fields = editableFields[type] || [];

  return (
    <>
      {/* Trigger */}
      <button
        onClick={openModal}
        className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1"
      >
        <FileText size={12} /> View
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "90vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {view === "edit" ? `Edit ${label}` : view === "confirmDelete" ? "Confirm Delete" : label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                {content.direction}
                {isPending && (
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold">PENDING</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === "detail" && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl transition-all active:scale-95"
              >
                <Share2 size={14} /> Share
              </button>
            )}
            <button
              onClick={closeModal}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* ── Detail View ── */}
          {view === "detail" && (
            <>
              {renderBody()}
              <div className="mt-2 p-3 rounded-xl bg-stone-50 dark:bg-gray-800/50 border border-stone-200 dark:border-gray-700">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Record ID</p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">{id || "N/A"}</p>
              </div>
              {/* Edit / Delete strip for pending slips */}
              {isPending && API[type] && (
                <div className="flex gap-3 pt-2 pb-4">
                  <button
                    onClick={openEdit}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setView("confirmDelete")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Edit View ── */}
          {view === "edit" && (
            <div className="space-y-4 pb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Update the fields below and tap Save.</p>
              {fields.map(f => (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{f.label}</label>
                  <input
                    type={f.type}
                    value={editData[f.key] ?? ""}
                    onChange={e => setEditData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-stone-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              ))}
              {actionError && (
                <p className="text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{actionError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setView("detail")}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── Confirm Delete View ── */}
          {view === "confirmDelete" && (
            <div className="space-y-5 pb-6 flex flex-col items-center text-center pt-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-3xl">🗑️</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Delete {label}?</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This action cannot be undone. The record will be permanently removed.
                </p>
              </div>
              {actionError && (
                <p className="text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl w-full">{actionError}</p>
              )}
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setView("detail")}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                >
                  {actionLoading ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}

          <div className="h-6" />
        </div>
      </div>
    </>
  );
}