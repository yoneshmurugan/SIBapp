import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useFetch from "../hooks/useFetch";

export default function CoordinatorsRoute() {
    const [isValid, setIsValid] = useState(null);

    const { data: access, loading } = useFetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/dashboard/coordinatoraccess`,
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
        return (
            <div className="w-full min-h-[200px] flex items-center justify-center">
                Checking coordinator access...
            </div>
        );

    return isValid ? <Outlet /> : <Navigate to="/noteligible" replace />;
}
