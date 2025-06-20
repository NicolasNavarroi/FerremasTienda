import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.tipo)) {
    // Redirección basada en el rol del usuario
    const redirectPath = {
      1: '/admin/usermanagement',    // Admin
      2: '/employee/productmanagement', // Employee
      3: '/client/profilepage'                 // Client
    }[user.tipo] || '/';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};