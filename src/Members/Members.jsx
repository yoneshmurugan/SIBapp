import { useEffect, useState, useCallback } from "react";
import Header from "../MainPage/Header";
import MemberList from "./Components/MemberList";
import DirectoryFilters from "./DirectoryFilter";
import ErrorComponent from "./Components/Error";
import useFetch from "../hooks/useFetch";
import HalfPageLoader from "./Components/Loader";

const getQueryString = filters => {
  const params = new URLSearchParams();
  if (filters.region && filters.region !== "All Regions") params.append("region", filters.region);
  if (filters.chapter && filters.chapter !== "All Chapters") params.append("chapter", filters.chapter);
  if (filters.vertical && filters.vertical !== "All Verticals") params.append("vertical", filters.vertical);
  if (filters.myChapterOnly) params.append("myChapterOnly", "true");
  if (filters.search) params.append("search", filters.search);
  // Hinting to the backend to include services in the response
  params.append("services", "true");
  return params.toString() ? `?${params.toString()}` : "";
};

function Members() {
  const [region, setRegion] = useState("All Regions");
  const [chapter, setChapter] = useState("All Chapters");
  const [vertical, setVertical] = useState("All Verticals");
  const [myChapterOnly, setMyChapterOnly] = useState(false);
  const [sort, setSort] = useState("Name A-Z");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    region: "All Regions",
    chapter: "All Chapters",
    vertical: "All Verticals",
    myChapterOnly: false,
    sort: "Name A-Z",
    search: "",
  });

  const { data: verticalnamesRaw } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/admin/vertical/getallverticals`,
    { method: "GET", credentials: "include" }
  );
  const { data: chapternamesRaw } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/chapter/main/getallchapternames`,
    { method: "GET", credentials: "include" }
  );
  const { data: regionnamesRaw } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/admin/region/getallregions`,
    { method: "GET", credentials: "include" }
  );

  const verticalnames = Array.isArray(verticalnamesRaw) ? verticalnamesRaw : [];
  const chapternames = Array.isArray(chapternamesRaw) ? chapternamesRaw : [];
  const regionnames = Array.isArray(regionnamesRaw) ? regionnamesRaw : [];

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = getQueryString(filters);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/profile/getallprofiles${query}`,
        { method: "GET", credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch profiles");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || "Error fetching data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.region, filters.chapter, filters.vertical, filters.myChapterOnly, filters.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Frontend Filtering and Sorting
  useEffect(() => {
    let result = [...data];

    // Search filter
    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(m => {
        const username = m.user?.username?.toLowerCase() || "";
        const company = m.company_name?.toLowerCase() || "";
        const vertical = Array.isArray(m.vertical_ids) 
          ? m.vertical_ids.join(" ").toLowerCase() 
          : Array.isArray(m.verticals) 
            ? m.verticals.join(" ").toLowerCase()
            : (m.verticals || "").toLowerCase();
        
        // Check both 'services' and 'services_offered'
        const servicesArr = m.services || m.services_offered || [];
        const services = Array.isArray(servicesArr) 
          ? servicesArr.join(" ").toLowerCase() 
          : servicesArr.toString().toLowerCase();
          
        const blood = m.blood_group?.toLowerCase() || "";
        
        return username.includes(q) || 
               company.includes(q) || 
               vertical.includes(q) || 
               services.includes(q) || 
               blood.includes(q);
      });
    }

    // Sort filter
    if (filters.sort) {
      result.sort((a, b) => {
        if (filters.sort === "Name A-Z") {
          return (a.user?.username || "").localeCompare(b.user?.username || "");
        } else if (filters.sort === "Name Z-A") {
          return (b.user?.username || "").localeCompare(a.user?.username || "");
        } else if (filters.sort === "Chapter") {
          return (a.chapter || "").localeCompare(b.chapter || "");
        } else if (filters.sort === "Region") {
          return (a.region || "").localeCompare(b.region || "");
        }
        return 0;
      });
    }

    setFilteredData(result);
  }, [data, filters.search, filters.sort]);

  const handleFilterChange = filters => setFilters(filters);
  const handleClear = resetFilters => {
    setFilters(resetFilters);
    // Reset individual states to keep them in sync
    setRegion(resetFilters.region);
    setChapter(resetFilters.chapter);
    setVertical(resetFilters.vertical);
    setSort(resetFilters.sort);
    setMyChapterOnly(resetFilters.myChapterOnly);
    setSearch(resetFilters.search);
  };

  const regionOptions = ["All Regions", ...regionnames];
  const chapterOptions = ["All Chapters", ...chapternames];
  const verticalOptions = ["All Verticals", ...verticalnames];

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen transition-colors duration-300">
      <div className="fixed top-[10px] left-0 w-full z-10 bg-transparent">
        <Header />
      </div>

      <main className="mt-[80px] w-full max-w-7xl px-4 sm:px-6 md:px-10 mx-auto">
        <h1 className="mb-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Members Directory
        </h1>

        <section className="w-full mb-6">
          <DirectoryFilters
            region={region} setRegion={setRegion}
            regions={regionOptions}
            chapter={chapter} setChapter={setChapter}
            chapters={chapterOptions}
            vertical={vertical} setVertical={setVertical}
            verticals={verticalOptions}
            myChapterOnly={myChapterOnly} setMyChapterOnly={setMyChapterOnly}
            sort={sort} setSort={setSort}
            onChange={handleFilterChange}
            onClear={handleClear}
            search={search} setSearch={setSearch}
          />
        </section>

        <section className="w-full h-full">
          {loading ? (
            <HalfPageLoader />
          ) : error ? (
            <ErrorComponent message={error} />
          ) : (
            <MemberList members={filteredData} />
          )}
        </section>
      </main>
    </div>
  );
}

export default Members;
