import { useState, useEffect } from "react";

function useSession() {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/profile`, {
      credentials: "include",
      signal: abortController.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error("No session");
        return res.json();
      })
      .then(data => setIsValid(Boolean(data.user)))
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error("Session fetch error:", err);
          setIsValid(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, []);

  return isValid;
}

export default useSession;
