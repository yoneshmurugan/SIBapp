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
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.myChapterOnly) params.append("myChapterOnly", "true");
  if (filters.search) params.append("search", filters.search);
  return params.toString() ? `?${params.toString()}` : "";
};

function Members() {
  const [region, setRegion] = useState("All Regions");
  const [chapter, setChapter] = useState("All Chapters");
  const [vertical, setVertical] = useState("All Verticals");
  const [myChapterOnly, setMyChapterOnly] = useState(true);
  const [sort, setSort] = useState("Name A-Z");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    region: "All Regions",
    chapter: "All Chapters",
    vertical: "All Verticals",
    myChapterOnly: true,
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
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = filters => setFilters(filters);
  const handleClear = resetFilters => setFilters(resetFilters);

  const regionOptions = ["All Regions", ...regionnames];
  const chapterOptions = ["All Chapters", ...chapternames];
  const verticalOptions = ["All Verticals", ...verticalnames];

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen transition-colors duration-300">
      
      {/* Header wrapper fixed directly to the top edge */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Main content pushed down dynamically based on the safe area + header height */}
      <main className="mt-[calc(env(safe-area-inset-top)_+_80px)] w-full max-w-7xl px-3 sm:px-6 md:px-10 pb-[calc(env(safe-area-inset-bottom)_+_1rem)]">
        <h1 className="pb-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Members Directory
        </h1>

        <section className="w-full mb-1">
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
            <MemberList members={data} />
          )}
        </section>
      </main>
    </div>
  );
}

export default Members;