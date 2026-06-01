import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRole }) => {
  const role = localStorage.getItem("authRole");

  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;