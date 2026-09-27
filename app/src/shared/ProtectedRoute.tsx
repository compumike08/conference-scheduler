import { Navigate } from "react-router";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
  redirectPath = '/',
}) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
