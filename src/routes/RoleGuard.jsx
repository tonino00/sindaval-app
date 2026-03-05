import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleGuard;
