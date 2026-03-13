import { useEffect, useState, useCallback } from "react";
import MemberList from "./Components/MemberList";
import ErrorComponent from "./Components/Error";
import useFetch from "../hooks/useFetch";
import HalfPageLoader from "./Components/Loader";
import PublicFilters from "./PublicFilter";
import Header from "../src1/MainPage/Header/Header";

/* ---------------------------------------
   Build query string safely
---------------------------------------- */
const getQueryString = (filters) => {
  const params = new URLSearchParams();

  if (filters.region && filters.region !== "All Regions")
    params.append("region", filters.region);

  if (filters.chapter && filters.chapter !== "All Chapters")
    params.append("chapter", filters.chapter);

  if (filters.vertical && filters.vertical !== "All Verticals")
    params.append("vertical", filters.vertical);

  if (filters.sort) params.append("sort", filters.sort);

  if (filters.searchterm)
    params.append("search", filters.searchterm.trim());

  return params.toString() ? `?${params.toString()}` : "";
};

const INITIAL_FILTERS = {
  region: "All Regions",
  chapter: "All Chapters",
  vertical: "All Verticals",
  sort: "Name A-Z",
  searchterm: "",
};

function PublicMembers() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------------------------------
     Static data fetch (once)
  ---------------------------------------- */
  const { data: verticalnamesRaw } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/public/getallverticals`,
    { method: "GET", credentials: "include" }
  );

  const { data: chapternamesRaw } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/public/getallchapternames`,
    { method: "GET", credentials: "include" }
  );

  const { data: regionnamesRaw } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/public/getallregions`,
    { method: "GET", credentials: "include" }
  );

  const verticals = ["All Verticals", ...(verticalnamesRaw ?? [])];
  const chapters = ["All Chapters", ...(chapternamesRaw ?? [])];
  const regions = ["All Regions", ...(regionnamesRaw ?? [])];

  /* ---------------------------------------
     Fetch profiles (mount + filter change)
  ---------------------------------------- */
  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const query = getQueryString(filters);
      console.log("Fetching with query:", query);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/public/getallprofiles${query}`,
        { method: "GET", credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch profiles");

      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [filters]);

  /* ---------------------------------------
     Handlers
  ---------------------------------------- */
  const handleFilterChange = useCallback((updated) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <Header isMembers={true} />
      <main className="mt-[120px] w-full max-w-7xl px-3 sm:px-6 md:px-10">
        <h1 className="pb-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-5">
          Members Directory
        </h1>

        <PublicFilters
          filters={filters}
          regions={regions}
          chapters={chapters}
          verticals={verticals}
          onChange={handleFilterChange}
          onClear={handleClear}
        />

        <section className="w-full mt-4">
          {loading ? (
            <HalfPageLoader />
          ) : error ? (
            <ErrorComponent message={error} />
          ) : (
            <MemberList members={data} />
          )}
        </section>  
      </main>
    </div>
  );
}

export default PublicMembers;
