import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCog, FaUserTie, FaUser, FaTools, FaSignOutAlt, FaHome, FaShoppingCart, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout, isAdmin, isEmployee } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <FaTools className="icon-logo" /> Ferremas
        </Link>
      </div>
      <div className="navbar-links">
        {/* Opciones comunes a todos los usuarios */}
        <Link to="/products">
          <FaShoppingCart className="icon" /> Productos
        </Link>

        {user ? (
          <>
            {/* Opciones para usuarios autenticados */}
            {isAdmin && (
              <Link to="/admin/users" className="admin-link">
                <MdDashboard className="icon" /> Panel Admin
              </Link>
            )}
            {isEmployee && (
              <Link to="/employee/products" className="employee-link">
                <MdDashboard className="icon" /> Panel Empleado
              </Link>
            )}
            {!isAdmin && !isEmployee && (
              <Link to="/profile">
                <FaUser className="icon" /> Mi Perfil
              </Link>
            )}

            <div className="user-menu">
              <span>
                {isAdmin && <FaUserCog className="icon" />}
                {isEmployee && <FaUserTie className="icon" />}
                {!isAdmin && !isEmployee && <FaUser className="icon" />}
                Hola, {user.username}
              </span>
              <button onClick={logout}>
                <FaSignOutAlt className="icon" /> Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Opciones para invitados */}
            <Link to="/login">
              <FaSignInAlt className="icon" /> Iniciar sesión
            </Link>
            <Link to="/register">
              <FaUserPlus className="icon" /> Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};