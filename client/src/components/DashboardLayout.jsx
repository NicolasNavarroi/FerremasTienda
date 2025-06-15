// src/components/DashboardLayout.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  const { user, loading, isAdmin, isEmployee } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          {isAdmin && (
            <>
              <h3>Admin Panel</h3>
              <nav>
                <a href="/admin/users">Gestión de Usuarios</a>
                <a href="/admin/stats">Estadísticas</a>
              </nav>
            </>
          )}
          {isEmployee && (
            <>
              <h3>Panel Empleado</h3>
              <nav>
                <a href="/employee/products">Gestión de Productos</a>
                <a href="/employee/inventory">Inventario</a>
              </nav>
            </>
          )}
        </aside>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};