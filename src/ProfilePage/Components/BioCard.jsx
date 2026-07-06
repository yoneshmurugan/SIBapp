import { useEffect, useState } from "react";
import { PencilLine, Save } from "lucide-react";
import BioSection from "./BioSection";

const MyBioCard = ({
  editable = false,
  initialBioData = [
    {
      title: "GAINS Profile",
      description : "hi bro" ,
      content:
        "Goals: Help 100 families achieve financial freedom by 2026. Accomplishments: 30+ years in finance, helped clients grow wealth. Interests: Stock market analysis, economic trends. Networks: Financial planning association, Investment clubs. Skills: Portfolio management, risk assessment, financial modeling.",
      defaultOpen: true,
    },
    {
      description : "hi very wrong bro" ,
      title: "30-sec Pitch",
      content:
        "Certified planner helping professionals create resilient, tax‑efficient portfolios with clear, goal‑based plans.",
      defaultOpen: false,
    },
    {
      description : "" ,
      title: "Why SIB?",
      content:
        "Community, accountability, and curated opportunities to expand networks and accelerate impact.",
      defaultOpen: false,
    },
  ],
}) => {
  const [isEditable, setEditable] = useState(editable);
  const [isEditing, setIsEditing] = useState(false);
  const [bioData, setBioData] = useState(initialBioData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    setEditable(editable);
  }, [editable]);

  useEffect(() => {
    setBioData(initialBioData);
  }, [initialBioData]);

  const handleContentChange = (index, newContent) => {
    setBioData(prev => prev.map((item, i) => (i === index ? { ...item, content: newContent } : item)));
  };

  const handleEditToggle = async () => {
    setError("");
    setResponse("");

    if (isEditing) {
      try {
        const serverdata = {
          bio : bioData[0].content,
          elevator_pitch_30s :bioData[1].content,
          why_sib : bioData[2].content
        }
        setLoading(true);

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/profile/updateprofile`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serverdata),
            credentials: "include",
          }
        );
        const result = await res.json();
        if (result?.errors || result?.message) {
          const errMsg = result?.errors?.[0]
            ? `${result?.errors?.[0].path} : ${result?.errors?.[0].msg}`
            : (result?.message || "An error occurred.");
          setError(errMsg);
        } else {
          setResponse("Profile updated successfully.");
        }
      } catch (err) {
        setError(err.message);
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">My Bio</h2>
          {isEditable && (
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

        <div className="space-y-3">
          {bioData.map((section, index) => (
            <BioSection
              key={section.title}
              title={section.title}
              content={section.content}
              description={section.description}
              defaultOpen={section.defaultOpen}
              editable={isEditing}
              onChange={(newContent) => handleContentChange(index, newContent)}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default MyBioCard;
