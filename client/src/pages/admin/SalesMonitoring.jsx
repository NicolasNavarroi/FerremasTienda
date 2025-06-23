import { useEffect, useState } from 'react';
import api from '../../api/config';
import '../../styles/AdminStyles.css';

export const SalesMonitoring = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const { data } = await api.get('/ventas'); // <- asegúrate de que esta ruta exista
        setVentas(data);
      } catch (err) {
        console.error('Error al cargar ventas:', err);
        setError('No se pudieron cargar las ventas.');
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, []);

  if (loading) return <div>Cargando ventas...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-container">
      <h2>Monitoreo de Ventas</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Estado Entrega</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>{venta.id}</td>
              <td>{venta.cliente}</td>
              <td>{new Date(venta.fecha).toLocaleDateString()}</td>
              <td>
                <ul>
                  {venta.productos.map((p, i) => (
                    <li key={i}>{p.nombre} x{p.cantidad}</li>
                  ))}
                </ul>
              </td>
              <td>${venta.total.toLocaleString()}</td>
              <td>{venta.estado_entrega}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
