import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/config'; // Importamos la instancia de axios configurada
import { getBrands } from '../../api/brands';
import { getCategories } from '../../api/categories';
import '../../styles/EmployeeStyles.css';

export const NewProductPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    id_marca: '',
    id_categoria: '',
    imagen: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          getBrands(),
          getCategories()
        ]);
        setMarcas(brandsResponse);
        setCategorias(categoriesResponse);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar marcas o categorías');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validación básica del tipo de imagen
      if (!file.type.match('image.*')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      setFormData(prev => ({ ...prev, imagen: file }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const requiredFields = ['nombre', 'precio', 'stock', 'id_marca', 'id_categoria'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
      }

      // Crear FormData para enviar la imagen
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('id_marca', formData.id_marca);
      formDataToSend.append('id_categoria', formData.id_categoria);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      // Enviar con Content-Type multipart/form-data
      const response = await api.post('/productos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Producto creado exitosamente');
      setTimeout(() => navigate('/employee/productmanagement'), 1500);
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError(err.response?.data?.error || err.message || 'Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employee-form-container">
      <h2>Registrar Nuevo Producto</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Precio:</label>
          <input
            type="number"
            name="precio"
            value={formData.precio}
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
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Marca:</label>
          <select
            name="id_marca"
            value={formData.id_marca}
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
          <label>Categoría:</label>
          <select
            name="id_categoria"
            value={formData.id_categoria}
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

        <div className="form-group">
          <label>Imagen del Producto:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {previewImage && (
            <div className="image-preview">
              <img 
                src={previewImage} 
                alt="Vista previa" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  marginTop: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
          )}
        </div>

        <div className="form-buttons">
          <button 
            type="submit" 
            className="btn-confirm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};