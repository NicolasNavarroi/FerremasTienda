// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/admin';
import '@styles/AdminStyles.css';

export const UserManagement = () => {
  const navigate = useNavigate();
  const { logout, registerEmployee } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form states
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    clave: ''
  });
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await api.getUsers();
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error al cargar empleados');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      if (!newEmployee.username || !newEmployee.email || !newEmployee.clave) {
        throw new Error('Todos los campos son requeridos');
      }
      if (newEmployee.clave.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      await registerEmployee({
        username: newEmployee.username,
        email: newEmployee.email,
        clave: newEmployee.clave
      });
      
      const data = await api.getUsers();
      setEmployees(data);
      setShowCreateModal(false);
      setNewEmployee({ username: '', email: '', clave: '' });
      setError(null);
    } catch (err) {
      setError('Error al crear empleado: ' + (err.response?.data?.error || err.message));
    }
  };


  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !editPassword) return;
    
    try {
      if (editPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Enviamos la contraseña en texto plano, el backend se encarga del hashing
      await api.updateUser(selectedEmployee.idUsuario, { 
        clave: editPassword
      });
      
      setShowEditModal(false);
      setEditPassword('');
      setSelectedEmployee(null);
      setError(null);
      alert('Contraseña actualizada correctamente');
    } catch (err) {
      setError('Error al actualizar contraseña: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este empleado?')) return;
    
    try {
      await api.deleteUser(id);
      setEmployees(employees.filter(emp => emp.idUsuario !== id));
      setError(null);
      alert('Empleado eliminado correctamente');
    } catch (err) {
      setError('Error al eliminar empleado: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="loading">Cargando empleados...</div>;
  
  return (
    <div className="employee-management">
      <header className="management-header">
        <h2>Gestión de Empleados</h2>
        <div className="header-actions">
          <button onClick={logout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="btn-close-error">
            ×
          </button>
        </div>
      )}

      <div className="admin-tabs">
        <button className="active">Gestión de Empleados</button>
        <button onClick={() => navigate('/admin/sales-monitoring')}>Monitoreo de Ventas</button>
      </div>

      <div className="employee-actions">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-create"
        >
          + Nuevo Empleado
        </button>
      </div>

      <div className="employee-list-container">
        {employees.length === 0 ? (
          <div className="no-employees">
            No hay empleados registrados. Crea uno nuevo para comenzar.
          </div>
        ) : (
          <table className="employee-list">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.idUsuario}>
                  <td>{employee.idUsuario}</td>
                  <td>{employee.Username}</td>
                  <td>{employee.Email}</td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowEditModal(true);
                      }}
                      className="btn-edit"
                    >
                      Editar Contraseña
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee.idUsuario)}
                      className="btn-delete"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para crear empleado */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Nuevo Empleado</h3>
            <form onSubmit={handleCreateEmployee}>
              <div className="form-group">
                <label>Nombre de usuario:</label>
                <input
                  type="text"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                  required
                  minLength="3"
                  placeholder="Ej: juanperez"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  required
                  placeholder="Ej: empleado@ferreteria.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña (mínimo 6 caracteres):</label>
                <input
                  type="password"
                  value={newEmployee.clave}
                  onChange={(e) => setNewEmployee({...newEmployee, clave: e.target.value})}
                  required
                  minLength="6"
                  placeholder="••••••"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-confirm"
                >
                  Crear Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar contraseña */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cambiar contraseña para {selectedEmployee.Username}</h3>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Nueva contraseña (mínimo 6 caracteres):</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  required
                  minLength="6"
                  placeholder="••••••"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                    setEditPassword('');
                  }}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-confirm"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};