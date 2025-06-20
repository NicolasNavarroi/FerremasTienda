import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import '../styles/DashboardLayout.css';

export const DashboardLayout = () => {
  const { user, loading, isAdmin, isEmployee, isClient } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          {isAdmin && (
            <div className="admin-panel">
              <h3>Panel Administrador</h3>
              <nav>
                <Link to="/admin/usermanagement" className="sidebar-link">Gestión de Usuarios</Link>
                <Link to="/admin/stats" className="sidebar-link">Estadísticas</Link>
              </nav>
            </div>
          )}
          
          {isEmployee && (
            <div className="employee-panel">
              <h3>Panel Empleado</h3>
              <nav>
                <Link to="/employee/productmanagement" className="sidebar-link">Gestión de Productos</Link>
                <Link to="/employee/inventory" className="sidebar-link">Inventario</Link>
              </nav>
            </div>
          )}

          {isClient && (
            <div className="client-panel">
              <h3>Mi Cuenta</h3>
              <nav>
                <Link to="/profile" className="sidebar-link">Perfil</Link>
                <Link to="/orders" className="sidebar-link">Mis Pedidos</Link>
              </nav>
            </div>
          )}
        </aside>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};