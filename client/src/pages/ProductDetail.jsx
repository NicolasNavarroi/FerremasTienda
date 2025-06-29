// src/pages/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../api/products';
import { useCart } from '../context/CartContexto';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaStar, FaChevronLeft, FaShare, FaHeart, FaTruck, FaShieldAlt, FaExchangeAlt, FaCreditCard } from 'react-icons/fa';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import "../styles/ProductDetail.css";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const WEBPAY_BASE_URL = "http://localhost:3001/transbank/webpay";

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setMessage('');
      
      if (!user?.id) throw new Error("Debes iniciar sesión para realizar una compra");
      if (!product) throw new Error("Producto no disponible");
      
      const total = product.precio * quantity;

      const response = await axios.post(`${WEBPAY_BASE_URL}/create`, {
        buy_order: `order_${Date.now()}`,
        session_id: `session_${user.id}_${Date.now()}`,
        amount: total,
        return_url: `${window.location.origin}/payment-result`
      });

      if (response.data?.url && response.data?.token) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.data.url;

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = response.data.token;

        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || "Error al procesar pago");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(id);
        
        const processedImages = productData.imagen 
          ? Array.isArray(productData.imagen) 
            ? productData.imagen.map(img => ({
                original: `http://localhost:3000${img}`,
                thumbnail: `http://localhost:3000${img}`
              }))
            : [{
                original: `http://localhost:3000${productData.imagen}`,
                thumbnail: `http://localhost:3000${productData.imagen}`
              }]
          : [{
              original: '/placeholder-product.jpg',
              thumbnail: '/placeholder-product.jpg'
            }];
        
        setProduct({
          ...productData,
          images: processedImages
        });
        
        setRelatedProducts([
          {
            id: 1,
            nombre: "Producto Relacionado 1",
            precio: 19990,
            imagen: "/placeholder-product.jpg",
            categoria: productData.categoria
          },
          {
            id: 2,
            nombre: "Producto Relacionado 2",
            precio: 24990,
            imagen: "/placeholder-product.jpg",
            categoria: productData.categoria
          }
        ]);
        
      } catch (err) {
        console.error('Error al cargar producto:', err);
        setError('No se pudo cargar el producto. Por favor intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity
    });
  };

  const handleQuantityChange = (value) => {
    const newValue = Math.max(1, Math.min(99, quantity + value));
    setQuantity(newValue);
  };

  if (loading) return <div className="loading">Cargando producto...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="not-found">Producto no encontrado</div>;

  return (
    <div className="product-detail-page">
      <Navbar />
      
      <div className="breadcrumb">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaChevronLeft /> Volver atrás
        </button>
        <span> / {product.categoria} / {product.nombre}</span>
      </div>

      <div className="product-detail-container">
        <div className="product-gallery">
          <div className="thumbnail-container">
            {product.images.map((img, index) => (
              <div 
                key={index} 
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img.thumbnail} alt={`Miniatura ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="main-image">
            <img 
              src={product.images[selectedImage].original} 
              alt={product.nombre} 
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </div>
        </div>

        <div className="product-info">
          <div className="product-header">
            <h1>{product.nombre}</h1>
            <div className="product-meta">
              <span>Código: {product.codigo_producto}</span>
              <div className="rating">
                <FaStar className="star" />
                <FaStar className="star" />
                <FaStar className="star" />
                <FaStar className="star" />
                <FaStar className="star half" />
                <span>(12 reseñas)</span>
              </div>
            </div>
          </div>

          <div className="price-section">
            <span className="current-price">${product.precio.toLocaleString('es-CL')}</span>
            {product.precio_anterior && (
              <span className="old-price">${product.precio_anterior.toLocaleString('es-CL')}</span>
            )}
            {product.descuento && (
              <span className="discount-badge">-{product.descuento}%</span>
            )}
          </div>

          <div className="product-description">
            <h3>Descripción</h3>
            <p>{product.descripcion || 'Este producto no tiene descripción detallada.'}</p>
          </div>

          <div className="product-specs">
            <h3>Especificaciones técnicas</h3>
            <ul>
              <li><strong>Marca:</strong> {product.marca || 'No especificada'}</li>
              <li><strong>Categoría:</strong> {product.categoria || 'No especificada'}</li>
              <li><strong>Stock disponible:</strong> {product.stock || 'Consultar'}</li>
            </ul>
          </div>

          <div className="add-to-cart-section">
        <div className="quantity-selector">
          <button onClick={() => handleQuantityChange(-1)}>-</button>
          <input 
            type="number" 
            min="1" 
            max="99" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
          />
          <button onClick={() => handleQuantityChange(1)}>+</button>
        </div>
        <div className="action-buttons">
          <button 
            className="add-to-cart-button"
            onClick={handleAddToCart}
          >
            <FaShoppingCart /> Añadir al carrito
          </button>
          <button 
            className="buy-now-button"
            onClick={handlePayment}
            disabled={loading || paymentLoading || !product}
          >
            {paymentLoading ? 'Procesando...' : (
              <>
                <FaCreditCard /> Comprar ahora
              </>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div className={`payment-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

          {message && (
            <div className={`payment-message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="product-actions">
            <button className="action-button">
              <FaHeart /> Guardar en favoritos
            </button>
            <button className="action-button">
              <FaShare /> Compartir
            </button>
          </div>

          <div className="delivery-info">
            <div className="delivery-option">
              <FaTruck />
              <div>
                <strong>Envío a domicilio</strong>
                <span>Despacho en 2-3 días hábiles</span>
              </div>
            </div>
            <div className="delivery-option">
              <FaShieldAlt />
              <div>
                <strong>Garantía</strong>
                <span>{product.garantia || '6 meses'} de garantía</span>
              </div>
            </div>
            <div className="delivery-option">
              <FaExchangeAlt />
              <div>
                <strong>Devoluciones</strong>
                <span>30 días para cambiar o devolver</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Productos relacionados</h2>
          <div className="related-products-grid">
            {relatedProducts.map(related => (
              <div key={related.id} className="related-product-card">
                <img src={related.imagen} alt={related.nombre} />
                <h3>{related.nombre}</h3>
                <span className="price">${related.precio.toLocaleString('es-CL')}</span>
                <button 
                  className="quick-add"
                  onClick={() => addToCart({ ...related, quantity: 1 })}
                >
                  + Añadir rápido
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="qa-section">
        <h2>Preguntas frecuentes</h2>
        <div className="qa-item">
          <h3>¿Este producto tiene garantía?</h3>
          <p>Sí, todos nuestros productos tienen garantía de {product.garantia || '6 meses'} contra defectos de fabricación.</p>
        </div>
        <div className="qa-item">
          <h3>¿Puedo retirar en tienda?</h3>
          <p>Sí, puedes seleccionar retiro en tienda al finalizar tu compra.</p>
        </div>
      </div>
    </div>
  );
};