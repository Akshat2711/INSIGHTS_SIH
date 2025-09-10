// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // you can return a spinner, skeleton, or blank div
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
