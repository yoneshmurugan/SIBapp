import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useFetch from "../hooks/useFetch";

export default function PresidentRoute() {
  const [isValid, setIsValid] = useState(null);

  const { data: access, loading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/caneditevents`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  useEffect(() => {
    if (typeof access?.hasaccess === "boolean") {
      setIsValid(access.hasaccess);
    }
  }, [access]);

  if (isValid === null || loading)
    return null;

  return isValid ? <Outlet /> : <Navigate to="/noteligible" replace />;
}
