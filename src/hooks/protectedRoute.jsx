import { Navigate, Outlet } from "react-router-dom";
import useSession from "./useSession";

export default function ProtectedRoute() {
  const isValid = useSession();

  if (isValid === null) return null;

  return isValid ? <Outlet /> : <Navigate to="/" replace />;
}
