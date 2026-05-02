import { Navigate, Outlet } from "react-router-dom";
import { AUTH } from "./routes";
import { storageHelper } from "../utils/localstorageHelper";
import { STORAGE_KEYS } from "../constants/constants";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = storageHelper.getItem(STORAGE_KEYS.token);
  const userString = storageHelper.getItem(STORAGE_KEYS.user);
  const user = userString ? JSON.parse(userString) : null;

  if (!token) {
    return <Navigate to={AUTH} replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={AUTH} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
