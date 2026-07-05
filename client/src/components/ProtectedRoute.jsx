import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireClinicSetup = true }) => {
  const { user, clinic } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireClinicSetup && !clinic) {
    return <Navigate to="/clinic-setup" replace />;
  }

  // If going to clinic-setup but already has a clinic
  if (!requireClinicSetup && clinic) {
     return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
