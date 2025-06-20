import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/admin';
import '@styles/AdminStyles.css';

export const UserManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    password: ''
  });
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await api.getUsers(2); // Solo empleados (rol 2)
        setEmployees(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async () => {
    try {
      await api.createUser({
        ...newEmployee,
        rol: 2 // Fuerza el rol de empleado
      });
      // Refrescar la lista
      const data = await api.getUsers(2);
      setEmployees(data);
      setShowCreateModal(false);
      setNewEmployee({ username: '', email: '', password: '' });
    } catch (err) {
      setError('Error al crear empleado');
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedEmployee || !editPassword) return;
    
    try {
      await api.updateUser(selectedEmployee.idUsuario, {
        clave: editPassword
      });
      setShowEditModal(false);
      setEditPassword('');
      setSelectedEmployee(null);
    } catch (err) {
      setError('Error al actualizar contraseña');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este empleado?')) return;
    
    try {
      await api.deleteUser(id);
      setEmployees(employees.filter(emp => emp.idUsuario !== id));
    } catch (err) {
      setError('Error al eliminar empleado');
    }
  };

  if (loading) return <div className="loading">Cargando empleados...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="employee-management">
      <header className="admin-header">
        <h1>Panel de Administración</h1>
        <div className="admin-tabs">
          <button className="active">Gestión de Empleados</button>
          <button onClick={() => navigate('/admin/sales-monitoring')}>Monitoreo de Ventas</button>
        </div>
        <button onClick={logout} className="btn-logout">
          Cerrar sesión
        </button>
      </header>

      <div className="employee-actions">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-create"
        >
          + Nuevo Empleado
        </button>
      </div>

      <div className="employee-list-container">
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
                    Editar
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
      </div>

      {/* Modal para crear empleado */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Crear Nuevo Empleado</h3>
            <div className="form-group">
              <label>Nombre de usuario:</label>
              <input
                type="text"
                value={newEmployee.username}
                onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button onClick={handleCreateEmployee} className="btn-confirm">
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar contraseña */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Contraseña de {selectedEmployee.Username}</h3>
            <div className="form-group">
              <label>Nueva Contraseña:</label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => {
                setShowEditModal(false);
                setSelectedEmployee(null);
              }}>
                Cancelar
              </button>
              <button onClick={handleUpdatePassword} className="btn-confirm">
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};