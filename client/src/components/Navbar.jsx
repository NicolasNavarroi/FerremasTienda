import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContexto'; 
import {
  FaUserCog, FaUserTie, FaUser, FaTools, FaSignOutAlt,
  FaShoppingCart, FaSignInAlt, FaUserPlus, FaArrowLeft
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import '@styles/Navbar.css';

export const Navbar = () => {
  const { user, logout, isAdmin, isEmployee } = useAuth();
  const { cart } = useCart(); // Obtén el carrito desde el contexto
  const location = useLocation();
  const navigate = useNavigate();

  const showBackButton = location.pathname !== '/' && location.key !== 'default';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {showBackButton && (
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
        )}
        <div className="navbar-brand animated-logo">
          <Link to="/">
            <FaTools className="icon-logo" /> Ferremas
          </Link>
        </div>
      </div>

      <div className="navbar-links">
        <Link to="/products">
          <FaShoppingCart className="icon" /> Productos
        </Link>

        {/* --- Añade este nuevo enlace --- */}
        {user && !isAdmin && !isEmployee && ( // Solo para clientes (rol 3)
          <Link to="/cart" className="cart-link">
            <FaShoppingCart className="icon" /> Carrito ({cart.length})
          </Link>
        )}

        {user ? (
          <>
            {isAdmin && (
              <Link to="/admin/usermanagement" className="admin-link">
                <MdDashboard className="icon" /> Panel Admin
              </Link>
            )}
            {isEmployee && (
              <Link to="/employee/productmanagement" className="employee-link">
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