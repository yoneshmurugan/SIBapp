import { Navigate, Outlet } from "react-router-dom";
import useSession from "./useSession";
import SessionLoadingScreen from "../Components/SessionLoadingScreen";

export default function ProtectedRoute() {
  const isValid = useSession();

  if (isValid === null) {
    return <SessionLoadingScreen hint="Loading member dashboard..." />;
  }

  return isValid ? <Outlet /> : <Navigate to="/" replace />;
}
