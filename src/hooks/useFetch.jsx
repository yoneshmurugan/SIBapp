import { useQuery } from '@tanstack/react-query';

function useFetch(url, options = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [url, options],
    queryFn: async () => {
      if (!url) return null;
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    },
    enabled: !!url,
  });

  return { data, loading: isLoading, error: error ? error.message : null };
}

export default useFetch;