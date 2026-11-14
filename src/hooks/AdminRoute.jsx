import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import SessionLoadingScreen from "../Components/SessionLoadingScreen";

export default function AdminRoute() {
  const [isValid, setIsValid] = useState(null);

  const { data: access, loading } = useFetch(
    `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/isadmin`,
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

  if (isValid === null || loading) {
    return (
      <SessionLoadingScreen
        title="Administration Console"
        subtitle="Verifying Administrative Privileges"
        hint="Authenticating security clearance..."
      />
    );
  }

  return isValid ? <Outlet /> : <Navigate to="/noteligible" replace />;
}
