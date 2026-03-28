import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  // Read token & role from localStorage
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role") || "";

  // ⭐ Normalize role (in case someone stored lower/upper mix)
  role = role.toUpperCase();

  // If no token → kick out to SignIn
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // ⭐ If user tries to access wrong dashboard, redirect them to the correct one
  if (requiredRole && role !== requiredRole.toUpperCase()) {
    return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />;
  }

  // If everything is correct → allow access
  return children;
};

export default ProtectedRoute;
