// ClientProductCard.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/cartContext';

export const ClientProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Intentando agregar producto:", product.idProducto); // Debug
    await addToCart(product);
  };

  return (
    <div className="client-product-card">
      <div className="product-content">
        <Link to={`/products/${product.idProducto}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <img 
            src={product.imagen} 
            alt={product.nombre}
            onError={(e) => e.target.src = '/default-product.jpg'}
          />
          <h3>{product.nombre}</h3>
          <p>${product.precio.toLocaleString()}</p>
        </Link>
      </div>
      
      <div className="product-actions"> {/* Contenedor separado para acciones */}
        <button 
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || loading}
          style={{ marginTop: '10px' }}
        >
          {product.stock > 0 
            ? (loading ? "Agregando..." : "Añadir al carrito") 
            : "Sin stock"}
        </button>
      </div>
    </div>
  );
};