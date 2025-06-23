import { useEffect, useState } from 'react';
import api from '../../api/config';
import '../../styles/AdminStyles.css';

export const AdminStats = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/ventas/estadisticas'); // Ajusta esta ruta a tu backend real
        setVentas(data);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
        setVentas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-container">
      <h2>Estadísticas de Ventas</h2>
      {loading ? (
        <p>Cargando estadísticas...</p>
      ) : ventas.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total Ventas</th>
              <th>Total Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v, index) => (
              <tr key={index}>
                <td>{v.fecha}</td>
                <td>{v.total_ventas}</td>
                <td>${v.total_ingresos.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay datos disponibles.</p>
      )}
    </div>
  );
};
