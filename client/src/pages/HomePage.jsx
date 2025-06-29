import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../api/products';
import "../styles/HomePage.css";

// Importación de imágenes
import hero1 from '../assets/images/carousel/hero1.jpg';
import hero2 from '../assets/images/carousel/hero2.png';
import hero3 from '../assets/images/carousel/hero3.jpg';

export const HomePage = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Array de slides solo con imágenes
  const slides = [
    { id: 1, image: hero1 },
    { id: 2, image: hero2 },
    { id: 3, image: hero3 }
  ];

  // Obtener productos destacados
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await getProducts({ 
          destacado: true,
          limit: 4
        });
        setFeaturedProducts(products);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setError("Error al cargar productos destacados");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Efecto para cambiar slides automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Función para cambiar slide manualmente
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Carrusel de imágenes */}
      <section className="hero-carousel">
        <div 
          className="hero-background" 
          style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          aria-label={`Slide ${currentSlide + 1}`}
        />
        
        <div className="carousel-indicators">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Sección de categorías */}
      <section id="featured" className="categories-section">
        <h2 className="section-title">Nuestras Categorías</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">🛠️</div>
            <h3>Herramientas</h3>
            <p>Manuales, eléctricas y profesionales</p>
            <a href="/category/herramientas" className="btn-link">Ver más</a>
          </div>
          <div className="category-card">
            <div className="category-icon">🚪</div>
            <h3>Materiales</h3>
            <p>Construcción y acabados</p>
            <a href="/category/materiales" className="btn-link">Ver más</a>
          </div>
          <div className="category-card">
            <div className="category-icon">💡</div>
            <h3>Eléctricos</h3>
            <p>Iluminación y componentes</p>
            <a href="/category/electricos" className="btn-link">Ver más</a>
          </div>
          <div className="category-card">
            <div className="category-icon">🚿</div>
            <h3>Fontanería</h3>
            <p>Tuberías y accesorios</p>
            <a href="/category/fontaneria" className="btn-link">Ver más</a>
          </div>
        </div>
      </section>

      {/* Sección de productos destacados */}
      <section className="featured-products">
        <div className="section-header">
          <h2 className="section-title">Productos Destacados</h2>
          <a href="/products" className="view-all">Ver todos</a>
        </div>
        
        {loading ? (
          <div className="loading-message">Cargando productos...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.imagen ? (
                    <img 
                      src={product.imagen} 
                      alt={product.nombre} 
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  ) : (
                    <div className="image-placeholder">[Sin imagen]</div>
                  )}
                </div>
                <h3>{product.nombre}</h3>
                <p className="price">${product.precio?.toLocaleString() || '0'}</p>
                <button className="btn btn-sm">Agregar al carrito</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sección de beneficios */}
      <section className="benefits-section">
        <h2 className="section-title">¿Por qué elegirnos?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🚚</div>
            <h3>Envío Rápido</h3>
            <p>Despacho en 24-48 hrs en Santiago</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🏭</div>
            <h3>Fabricantes</h3>
            <p>Representamos a las mejores marcas</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💳</div>
            <h3>Múltiples Pagos</h3>
            <p>Transferencia, tarjeta y webpay</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📞</div>
            <h3>Asesoría</h3>
            <p>Expertos en cada área</p>
          </div>
        </div>
      </section>

      {/* Llamado a la acción final */}
      <section className="final-cta">
        <h2>¿Necesitas ayuda con tu proyecto?</h2>
        <p>Contáctanos y nuestro equipo te asesorará</p>
        <div className="cta-buttons">
          <a href="/contact" className="btn btn-primary">Contáctanos</a>
          <a href="/catalog" className="btn btn-outline">Descargar Catálogo</a>
        </div>
      </section>
    </div>
  );
};