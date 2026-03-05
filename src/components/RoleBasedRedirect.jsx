import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleBasedRedirect = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default RoleBasedRedirect;
