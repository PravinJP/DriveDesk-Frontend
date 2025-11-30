// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && auth.role !== requiredRole) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
