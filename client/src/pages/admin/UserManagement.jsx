// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../api/config';
import './AdminStyles.css';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/trabajadores');
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      try {
        await api.delete(`/admin/trabajadores/${userId}`);
        setUsers(users.filter(user => user.idUsuario !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div className="admin-container">
      <h2>Gestión de Usuarios</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.idUsuario}>
              <td>{user.idUsuario}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button className="btn-edit">Editar</button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(user.idUsuario)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};