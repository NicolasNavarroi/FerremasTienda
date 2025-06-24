// src/pages/employee/EditProductPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/config';
import '../../styles/EmployeeStyles.css';

export const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    id_marca: '',
    id_categoria: ''
  });

  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducto, resMarcas, resCategorias] = await Promise.all([
          api.get(`/productos/${id}`),
          api.get('/marcas'),
          api.get('/categorias')
        ]);

        const prod = resProducto.data;
        setProducto({
          nombre: prod.nombre || '',
          descripcion: prod.descripcion || '',
          precio: prod.precio || '',
          stock: prod.stock || '',
          id_marca: prod.id_marca || '',
          id_categoria: prod.id_categoria || ''
        });

        setMarcas(resMarcas.data?.data || resMarcas.data || []);
        setCategorias(resCategorias.data?.data || resCategorias.data || []);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('No se pudo cargar el producto. Intente de nuevo.');
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!producto.nombre || !producto.precio || !producto.stock || !producto.id_marca || !producto.id_categoria) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      await api.put(`/productos/${id}`, {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: parseFloat(producto.precio),
        stock: parseInt(producto.stock),
        id_marca: parseInt(producto.id_marca),
        id_categoria: parseInt(producto.id_categoria)
      });

      setSuccess('Producto actualizado correctamente.');
      setTimeout(() => navigate('/employee/productmanagement'), 1500);
    } catch (err) {
      console.error('Error actualizando producto:', err);
      setError('No se pudo actualizar el producto.');
    }
  };

  return (
    <div className="employee-form-container">
      <h2>Editar Producto</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={producto.descripcion}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="precio">Precio:</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={producto.precio}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={producto.stock}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="id_marca">Marca:</label>
          <select
            id="id_marca"
            name="id_marca"
            value={producto.id_marca}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una marca</option>
            {marcas.map((m) => (
              <option key={m.id_marca} value={m.id_marca}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="id_categoria">Categoría:</label>
          <select
            id="id_categoria"
            name="id_categoria"
            value={producto.id_categoria}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-confirm">Guardar cambios</button>
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};
