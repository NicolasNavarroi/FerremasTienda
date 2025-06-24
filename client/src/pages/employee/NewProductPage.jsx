import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/config';
import '../../styles/EmployeeStyles.css';

export const NewProductPage = () => {
  const navigate = useNavigate();

  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    marca: '',
    categoria: ''
  });

  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMarcas, resCategorias] = await Promise.all([
          api.get('/marcas'),
          api.get('/categorias')
        ]);

        console.log('Marcas: ', resMarcas.data);
        console.log('Categorias: ', resCategorias.data);

        setMarcas(resMarcas.data?.data || []);
        setCategorias(resCategorias.data || []);
      } catch (err) {
        console.error('Error al cargar marcas o categorías:', err);
        setError('Error al cargar marcas o categorías');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      const { nombre, precio, stock, marca, categoria } = producto;
      if (!nombre || !precio || !stock || !marca || !categoria) {
        throw new Error('Todos los campos obligatorios deben estar completos.');
      }

      const res = await api.post('/productos', {
        ...producto,
        id_marca: parseInt(marca),
        id_categoria: parseInt(categoria),
        precio: parseFloat(precio),
        stock: parseInt(stock)
      });

      setSuccess('Producto creado correctamente');
      setTimeout(() => navigate('/employee/productmanagement'), 1500);
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="employee-form-container">
      <h2>Registrar Nuevo Producto</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={producto.descripcion}
            onChange={handleChange}
            rows="3"
            style={{ backgroundColor: 'white' }} // para que no se vea negro
          />
        </div>

        <div className="form-group">
          <label>Precio:</label>
          <input
            type="number"
            name="precio"
            value={producto.precio}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            value={producto.stock}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Marca:</label>
          <select
            name="marca"
            value={producto.marca}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una marca</option>
            {Array.isArray(marcas) && marcas.map((m) => (
              <option key={m.id_marca} value={m.id_marca}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Categoría:</label>
          <select
            name="categoria"
            value={producto.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {Array.isArray(categorias) && categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-confirm">Guardar</button>
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};
