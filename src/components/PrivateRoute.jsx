import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <h2>Loading...</h2>; // Show a loading state while session is being retrieved
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
