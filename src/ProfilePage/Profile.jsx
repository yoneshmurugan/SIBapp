import Header from "../MainPage/Header";
import ProfileStrip from "./Components/ProfileStrip";
import ProfileCard from "./Components/ProfileCard";
import MyBioCard from "./Components/BioCard";
import ProfessionalDetailsCard from "./Components/ProfessionalDetails";
import IdCardModal from "./Components/IDcard";
import EarnedBadgesCard from "./Components/EarnedBadgesCard";
import ViewProfile from "./ViewProfile";
import useFetch from "../hooks/useFetch";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CreditCard, RefreshCw } from "lucide-react";

const isFilled = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return true;
};

function Profile() {
  const [editable, setEditable] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [completionPercentage, setcompletionPercentage] = useState(0);
  const [showIdCard, setShowIdCard] = useState(false);
  const { id } = useParams();

  const queryParams = new URLSearchParams(window.location.search);
  const user = queryParams.get("user");

  if (id) {
    return <ViewProfile />;
  }

  const { data: showProfileData, loading: loading1, error: error1 } = useFetch(
    id
      ? null
      : `${import.meta.env.VITE_BACKEND_SERVER}/profile/showprofile`,
    {
      method: "GET",
      credentials: "include"
    }
  );

  const { data: getProfileData, loading: loading2, error: error2 } = useFetch(
    id
      ? null
      : `${import.meta.env.VITE_BACKEND_SERVER}/profile/getprofile`,
    {
      method: "GET",
      credentials: "include"
    }
  );

  useEffect(() => {
    if (showProfileData?.editable && !id) {
      setEditable(showProfileData.editable);
    }
  }, [showProfileData, id]);

  useEffect(() => {
    if (!getProfileData) return;
    if (getProfileData.message === "Profile not found") {
      (async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER}/profile/createprofile`,
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            }
          );
          const data = await res.json();
          setProfileData(data);
        } catch (err) {
          console.error("Error creating profile:", err);
        }
      })();
    } else {
      const formattedData = {
        ...getProfileData,
        wedding_date: getProfileData.wedding_date?.split("T")[0],
        dob: getProfileData.dob?.split("T")[0]
      };
      setProfileData({ ...formattedData, vertical_ids: getProfileData.vertical_ids });
    }
  }, [getProfileData]);

  useEffect(() => {
    if (!profileData) {
      setcompletionPercentage(0);
      return;
    }
    const personalFields = [
      "company_phone",
      "company_email",
      "company_address",
      "dob",
      "wedding_date",
      "blood_group",
      "native_place",
      "vagai_category",
      "kuladeivam",
      "kulam_category"
    ];
    const professionalFields = [
      "company_name",
      "website",
      "years_in_business",
      "annual_turnover",
      "services",
      "vertical_names",
      "ideal_referral"
    ];
    const bioFields = [
      "bio",
      "elevator_pitch_30s",
      "why_sib"
    ];
    const fieldsToCheck = [
      ...personalFields,
      ...professionalFields,
      ...bioFields
    ];
    const total = fieldsToCheck.length;
    const filled = fieldsToCheck.reduce((acc, key) => {
      const val = profileData[key];
      return acc + (isFilled(val) ? 1 : 0);
    }, 0);
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    setcompletionPercentage(pct);
  }, [profileData]);

  if (loading1 || loading2) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (error1 || error2) {
    console.error(error1 || error2);
    return (
      <div className="text-red-500 text-center mt-10">
        Failed to load profile.
      </div>
    );
  }

  // If we are viewing another user's profile via ID, render the ViewProfile component.
  if (id) {
    return <ViewProfile />;
  }

  return (
    <main className="min-h-screen bg-gray-1/50">
      <div className="container mx-auto px-4 py-4">
        {editable && <Header />}

        <div className="mt-3 flex flex-col items-center gap-2">
          <ProfileStrip
            name={profileData?.user?.username}
            email={profileData?.user?.email}
            avatarUrl={profileData?.profile_image_url}
            chapter={profileData?.chaptername}
            user_id={profileData?.user?._id}
            profile_id={profileData?._id}
            editable={editable}
            completionPercentage={completionPercentage}
          />
        </div>

        {/* Action Bar for Profile */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          
          {!id && (
            <button
              onClick={() => setShowIdCard(true)}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm"
            >
              <CreditCard size={18} />
              View ID Card
            </button>
          )}
        </div>

        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="order-1">
            <ProfileCard
              data={{
                displayName: profileData?.display_name,
                phone: profileData?.company_phone,
                email: profileData?.company_email,
                address: profileData?.company_address,
                dob: profileData?.dob,
                wedding: profileData?.wedding_date,
                bloodGroup: profileData?.blood_group,
                motherTongue: profileData?.native_place,
                subCaste: profileData?.vagai_category,
                kuladeivam: profileData?.kuladeivam,
                gothram: profileData?.kulam_category
              }}
              editable={editable}
            />
          </div>
          <div className="order-2">
            <ProfessionalDetailsCard
              datagiven={{
                company: profileData?.company_name,
                website: profileData?.website,
                years: profileData?.years_in_business,
                turnover: profileData?.annual_turnover,
                services: profileData?.services || [],
                verticals: profileData?.vertical_names || [],
                referral: profileData?.ideal_referral
              }}
              editable={editable}
            />
          </div>
          <div className="order-3 md:col-span-2 lg:col-span-1 flex flex-col gap-4">
            <EarnedBadgesCard />
            <MyBioCard
              editable={editable}
              initialBioData={[
                {
                  title: "GAINS Profile",
                  content: profileData?.bio,
                  defaultOpen: true,
                  description: "A brief summary of your goals, achievements, interests, connections, and skills."
                },
                {
                  title: "30-sec Pitch",
                  content: profileData?.elevator_pitch_30s,
                  defaultOpen: false,
                  description: "A concise introduction highlighting your business and main benefits in 30 seconds."
                },
                {
                  title: "Why SIB?",
                  content: profileData?.why_sib,
                  defaultOpen: false,
                  description: "An opportunity to grow by connecting with the Sengunthar business community."
                }
              ]}
            />
          </div>
        </section>
      </div>

      {!id && showIdCard && (
        <IdCardModal
          isOpen={showIdCard}
          onClose={() => setShowIdCard(false)}
          profileData={profileData}
          idno={profileData?.membership?.idno}
        />
      )}
    </main>
  );
}

export default Profile;