import { useState, useEffect } from 'react';
import { 
  getProducts, 
  deleteProduct 
} from '../../api/products';
import "../../styles/EmployeeStyles.css";

export const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(product => product.idProducto !== productId));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('No se pudo eliminar el producto');
      }
    }
  };

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="employee-container">
      <h2>Gestión de Productos</h2>
      <div className="product-actions">
        <a href="/employee/products/new" className="btn-add">+ Nuevo Producto</a>
      </div>
      
      {products.length === 0 ? (
        <div className="no-products">
          No hay productos registrados
        </div>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.idProducto}>
                <td>{product.idProducto}</td>
                <td>{product.nombre}</td>
                <td>
                  {typeof product.precio === 'number'
                    ? `$${product.precio.toLocaleString()}`
                    : 'N/A'}
                </td>
                <td>{product.stock}</td>
                <td className="actions-cell">
                  <a 
                    href={`/employee/products/edit/${product.idProducto}`} 
                    className="btn-edit"
                  >
                    Editar
                  </a>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(product.idProducto)}
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
  );
};