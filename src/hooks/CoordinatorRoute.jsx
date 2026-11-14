import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import SessionLoadingScreen from "../Components/SessionLoadingScreen";

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

    if (isValid === null || loading) {
        return (
            <SessionLoadingScreen
                title="Leadership Portal"
                subtitle="Verifying Coordinator & Leadership Access"
                hint="Authenticating permissions..."
            />
        );
    }

    return isValid ? <Outlet /> : <Navigate to="/noteligible" replace />;
}
