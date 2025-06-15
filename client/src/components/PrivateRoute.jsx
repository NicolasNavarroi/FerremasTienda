// src/components/PrivateRoute.jsx (actualizado)
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAdmin, isEmployee } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!user) return <Navigate to="/login" />;

  // Verificar roles
  const hasAccess = 
    (allowedRoles.includes(1))&& isAdmin || 
    (allowedRoles.includes(2)) && isEmployee;

  if (!hasAccess) return <Navigate to="/" />;

  return children;
};