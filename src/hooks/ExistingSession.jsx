import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import SessionLoadingScreen from "../Components/SessionLoadingScreen";

export default function ExistingSession() {
    const [isValid, setIsValid] = useState(null);
    const [isadmin, setIsAdmin] = useState(false);

    const { data: access, loading, error } = useFetch(
        `${import.meta.env.VITE_BACKEND_SERVER}/authenticate`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    useEffect(() => {
        if (error) {
            setIsValid(false);
            return;
        }
        if (!loading && access !== null) {
            if (access?.message === "Authenticated") {
                setIsValid(true);
            } else {
                setIsValid(false);
            }
        }
        if (!loading && access !== null) {
            if (access?.isAdmin === true) {
                setIsAdmin(true);
            }
        }
    }, [access, loading, error]);

    if (isValid === null || loading) {
        return <SessionLoadingScreen hint="Verifying active session..." />;
    }

    if (isadmin === true) {
        return <Navigate to="/admin" replace />;
    }
    if (isValid === false) {
        return <Navigate to="/signin" replace />;
    }

    return <Navigate to="/dashboard" replace />;
}
