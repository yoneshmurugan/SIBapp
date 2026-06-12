import { useEffect, useState, useCallback, useMemo } from "react";
import Header from '../MainPage/Header/Header.jsx';
import Footer from '../MainPage/Footer/Footer.jsx';
import Hero from './Hero.jsx';
import Main from './Main.jsx';
import useFetch from "../../hooks/useFetch";
import HalfPageLoader from "../../Members/Components/Loader";
import ErrorComponent from "../../Members/Components/Error";

const getQueryString = filters => {
  const params = new URLSearchParams();
  if (filters.region && filters.region !== "All Regions") params.append("region", filters.region);
  if (filters.chapter && filters.chapter !== "All Chapters") params.append("chapter", filters.chapter);
  if (filters.vertical && filters.vertical !== "All Verticals") params.append("vertical", filters.vertical);
  if (filters.search) params.append("search", filters.search);
  params.append("services", "true");
  return params.toString() ? `?${params.toString()}` : "";
};

function Members() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [region, setRegion] = useState("All Regions");
  const [chapter, setChapter] = useState("All Chapters");
  const [vertical, setVertical] = useState("All Verticals");
  const [sort, setSort] = useState("Name A-Z");
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    region: "All Regions",
    chapter: "All Chapters",
    vertical: "All Verticals",
    sort: "Name A-Z",
    search: "",
  });

  // Background Metadata Fetching
  const { data: verticalnamesRaw } = useFetch(`${import.meta.env.VITE_BACKEND_SERVER}/public/getallverticals`);
  const { data: chapternamesRaw } = useFetch(`${import.meta.env.VITE_BACKEND_SERVER}/public/getallchapternames`);
  const { data: regionnamesRaw } = useFetch(`${import.meta.env.VITE_BACKEND_SERVER}/public/getallregions`);

  const verticalnames = verticalnamesRaw || [];
  const chapternames = chapternamesRaw || [];
  const regionnames = regionnamesRaw || [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = getQueryString(filters);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/public/getallprofiles${query}`,
        { method: "GET", credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to load directory");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.region, filters.chapter, filters.vertical, filters.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // PERFORMANCE: Use useMemo for filtering and sorting
  // This ensures the complex logic only runs when 'data', 'search', or 'sort' actually changes.
  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(m => {
        const username = m.user?.username?.toLowerCase() || "";
        const company = m.company_name?.toLowerCase() || "";
        const verticalStr = Array.isArray(m.verticals) 
          ? m.verticals.join(" ").toLowerCase() 
          : (m.verticals || "").toLowerCase();
        
        const servicesArr = m.services || m.services_offered || [];
        const servicesStr = Array.isArray(servicesArr) 
          ? servicesArr.join(" ").toLowerCase() 
          : servicesArr.toString().toLowerCase();
          
        const blood = m.blood_group?.toLowerCase() || "";
        
        return username.includes(q) || 
               company.includes(q) || 
               verticalStr.includes(q) || 
               servicesStr.includes(q) || 
               blood.includes(q);
      });
    }

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

    return result;
  }, [data, filters.search, filters.sort]);

  const handleFilterChange = useCallback(newFilters => setFilters(newFilters), []);
  
  const handleClear = useCallback(resetFilters => {
    setFilters(resetFilters);
    setRegion(resetFilters.region);
    setChapter(resetFilters.chapter);
    setVertical(resetFilters.vertical);
    setSort(resetFilters.sort);
    setSearch(resetFilters.search);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header isMembers={true} style={{ background: "rgba(0, 0, 0, 0.07)" }} />
      
      <main className="w-full">
        <Hero />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pb-20">
          <Main 
            data={filteredData}
            totalCount={data.length}
            loading={loading}
            error={error}
            region={region} setRegion={setRegion} regions={["All Regions", ...regionnames]}
            chapter={chapter} setChapter={setChapter} chapters={["All Chapters", ...chapternames]}
            vertical={vertical} setVertical={setVertical} verticals={["All Verticals", ...verticalnames]}
            sort={sort} setSort={setSort}
            search={search} setSearch={setSearch}
            onChange={handleFilterChange}
            onClear={handleClear}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Members;