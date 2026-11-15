import { Navigate, Outlet } from "react-router-dom";
import useSession from "./useSession";
import SessionLoadingScreen from "../Components/SessionLoadingScreen";
import usePushNotifications from "./usePushNotifications";

export default function ProtectedRoute() {
  const isValid = useSession();
  usePushNotifications();

  if (isValid === null) {
    return <SessionLoadingScreen hint="Loading member dashboard..." />;
  }

  return isValid ? <Outlet /> : <Navigate to="/" replace />;
}
