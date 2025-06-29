import { useEffect, useState } from 'react';
import api from '../../api/config';
import '../../styles/EmployeeStyles.css';

export const InventoryPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const { data } = await api.get('/productos');
        setProductos(data);
      } catch (err) {
        console.error('Error al cargar el inventario:', err);
        setError('No se pudo cargar el inventario.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventario();
  }, []);

  if (loading) return <div>Cargando inventario...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="employee-container">
      <h2>Inventario de Productos</h2>
      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.idProducto}>
              <td>{p.idProducto}</td>
              <td>{p.nombre}</td>
              <td>{p.marca || '—'}</td>
              <td>{p.categoria || '—'}</td>
              <td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
